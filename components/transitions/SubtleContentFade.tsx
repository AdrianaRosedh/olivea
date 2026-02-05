"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useAnimation, useReducedMotion } from "framer-motion";

function isModifiedEvent(e: MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

function getSameOriginHref(a: HTMLAnchorElement) {
  const href = a.getAttribute("href");
  if (!href) return null;
  if (href.startsWith("#")) return null; // in-page anchors handled separately
  if (href.startsWith("mailto:")) return null;
  if (href.startsWith("tel:")) return null;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

/** Normalize trailing slashes */
function normalizePath(p: string) {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

/** Remove leading locale segment like /en or /es */
function stripLocale(pathname: string) {
  return normalizePath(pathname).replace(/^\/(en|es)(?=\/|$)/, "");
}

/** Are we already on this page? (ignore hash) */
function isSamePage(nextHref: string) {
  const cur = new URL(window.location.href);
  const next = new URL(nextHref, window.location.href);

  return (
    normalizePath(cur.pathname) === normalizePath(next.pathname) &&
    cur.search === next.search
    // intentionally ignore hash
  );
}

/** Is this a locale-only switch to the "same" logical page? */
function isLocaleOnlySwitch(nextHref: string) {
  const cur = new URL(window.location.href);
  const next = new URL(nextHref, window.location.href);

  // Same query? (keep strict so we don't preserve scroll across actual page variants)
  if (cur.search !== next.search) return false;

  return stripLocale(cur.pathname) === stripLocale(next.pathname);
}

/** --- Cross-remount handoff (for /es <-> /en) --- */
const FADE_STORAGE_KEY = "olivea:fade-nav";

type FadeNavPayload = {
  at: number; // timestamp
  preserveScroll: boolean;
  scrollY: number | null;
};

function readFadePayload(): FadeNavPayload | null {
  try {
    const raw = sessionStorage.getItem(FADE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FadeNavPayload;

    // stale guard (2s is plenty)
    if (!parsed?.at || Date.now() - parsed.at > 2000) {
      sessionStorage.removeItem(FADE_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeFadePayload(payload: FadeNavPayload) {
  try {
    sessionStorage.setItem(FADE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function clearFadePayload() {
  try {
    sessionStorage.removeItem(FADE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function MainFadeRouter({
  children,
  duration = 0.6,
  fadeInDuration,
  fadeOutDuration,
}: {
  children: React.ReactNode;
  duration?: number;
  fadeInDuration?: number; // optional override
  fadeOutDuration?: number; // optional override
}) {
  const router = useRouter();
  const pathname = usePathname();
  const controls = useAnimation();
  const reduce = useReducedMotion();

  const pendingHrefRef = useRef<string | null>(null);

  // use a ref (no re-render mid-transition)
  const isFadingOutRef = useRef(false);

  const outDur = fadeOutDuration ?? duration;
  const inDur = fadeInDuration ?? duration * 1.35;

  // Read payload once per mount (if coming from a fade-out navigation)
  const initialPayload = useMemo(() => {
    if (typeof window === "undefined") return null;
    return readFadePayload();
  }, []);

  // Start hidden ONLY if we know we just faded out from the previous page.
  const [startHidden] = useState(() => Boolean(initialPayload && !reduce));

  // Ensure we start in the right opacity
  useEffect(() => {
    controls.set({ opacity: startHidden ? 0 : 1 });
  }, [controls, startHidden]);

  // When the route changes, restore scroll if needed, then fade back in
  useEffect(() => {
    if (reduce) {
      controls.set({ opacity: 1 });
      clearFadePayload();
      pendingHrefRef.current = null;
      isFadingOutRef.current = false;
      return;
    }

    // If we have a payload from previous page, optionally restore scroll
    const payload = readFadePayload();
    if (payload?.preserveScroll && typeof payload.scrollY === "number") {
      const y = payload.scrollY;

      // Wait for paint, then restore
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, left: 0, behavior: "auto" });
        });
      });
    }

    // Always fade to visible on route change (safe even if already visible)
    controls.start({
      opacity: 1,
      transition: {
        duration: inDur,
        ease: [0.22, 1, 0.36, 1],
      },
    });

    clearFadePayload();
    pendingHrefRef.current = null;
    isFadingOutRef.current = false;
  }, [pathname, controls, inDur, reduce]);

  // Global link interception
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      if (reduce) return;
      if (isModifiedEvent(e)) return;

      const target = e.target as HTMLElement | null;
      const a = target?.closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      // Opt-outs
      if (a.dataset.noFade === "true") return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const href = getSameOriginHref(a);
      if (!href) return;

      // SAME PAGE → no fade
      if (isSamePage(href)) {
        const next = new URL(href, window.location.href);
        if (next.hash && next.hash !== window.location.hash) {
          window.location.hash = next.hash;
        }
        return;
      }

      e.preventDefault();
      if (isFadingOutRef.current) return;

      // Decide if we should preserve scroll for this navigation
      const preserveScroll =
        a.dataset.preserveScroll === "true" || isLocaleOnlySwitch(href);

      isFadingOutRef.current = true;
      pendingHrefRef.current = href;

      await controls.start({
        opacity: 0,
        transition: {
          duration: outDur,
          ease: [0.4, 0.0, 0.2, 1],
        },
      });

      // ✅ Persist "fade-in needed" across potential remounts (like /es <-> /en)
      writeFadePayload({
        at: Date.now(),
        preserveScroll,
        scrollY: preserveScroll ? window.scrollY : null,
      });

      // Navigate while hidden
      if (preserveScroll) {
        router.push(href, { scroll: false });
      } else {
        router.push(href);
      }
    };

    document.addEventListener("click", onClick, true); // capture phase
    return () => document.removeEventListener("click", onClick, true);
  }, [router, controls, outDur, reduce]);

  return (
    <motion.div style={{ willChange: "opacity" }} animate={controls}>
      {children}
    </motion.div>
  );
}