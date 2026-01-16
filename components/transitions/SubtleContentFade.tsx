"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const pendingScrollYRef = useRef<number | null>(null);
  const shouldRestoreScrollRef = useRef(false);

  const [isFadingOut, setIsFadingOut] = useState(false);

  const outDur = fadeOutDuration ?? duration;
  const inDur = fadeInDuration ?? duration * 1.35;

  // Ensure we start visible
  useEffect(() => {
    controls.set({ opacity: 1 });
  }, [controls]);

  // When the route actually changes, optionally restore scroll, then fade back in
  useEffect(() => {
    if (!pendingHrefRef.current) return;

    // Best-effort scroll restore (useful for locale-only switches)
    if (shouldRestoreScrollRef.current && pendingScrollYRef.current != null) {
      const y = pendingScrollYRef.current;

      // Wait a tick so the new tree paints, then restore.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, left: 0, behavior: "auto" });
        });
      });
    }

    controls.start({
      opacity: 1,
      transition: {
        duration: reduce ? 0 : inDur,
        ease: [0.22, 1, 0.36, 1],
      },
    });

    pendingHrefRef.current = null;
    pendingScrollYRef.current = null;
    shouldRestoreScrollRef.current = false;
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

      // SAME PAGE → no fade (hash-only can be handled)
      if (isSamePage(href)) {
        const next = new URL(href, window.location.href);
        if (next.hash && next.hash !== window.location.hash) {
          window.location.hash = next.hash;
        }
        return;
      }

      // Prevent immediate navigation
      e.preventDefault();
      if (isFadingOut) return;

      // Decide if we should preserve scroll for this navigation
      // - Locale-only switches: preserve
      // - Or allow manual override with data-preserve-scroll="true"
      const preserveScroll =
        a.dataset.preserveScroll === "true" || isLocaleOnlySwitch(href);

      shouldRestoreScrollRef.current = preserveScroll;
      pendingScrollYRef.current = preserveScroll ? window.scrollY : null;

      setIsFadingOut(true);
      pendingHrefRef.current = href;

      // Fade out
      await controls.start({
        opacity: 0,
        transition: {
          duration: outDur,
          ease: [0.4, 0.0, 0.2, 1],
        },
      });

      // Navigate while hidden
      if (preserveScroll) {
        router.push(href, { scroll: false });
      } else {
        router.push(href);
      }

      setIsFadingOut(false);
    };

    document.addEventListener("click", onClick, true); // capture phase
    return () => document.removeEventListener("click", onClick, true);
  }, [router, controls, outDur, reduce, isFadingOut]);

  return (
    <motion.div style={{ willChange: "opacity" }} animate={controls}>
      {children}
    </motion.div>
  );
}
