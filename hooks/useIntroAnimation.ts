// hooks/useIntroAnimation.ts
// ─────────────────────────────────────────────────────────────────────
// The home page intro, as ONE ordered sequence:
//
//   green screen → alebrije draws → loader bars fade → the screen and the
//   alebrije shrink together into the hero → green fades → page
//
// ★ WHY ONE SEQUENCE. The intro used to run on two independent clocks: the
//   morph started from page-load signals (~1 s) while the alebrije waited for
//   an idle callback, a lazy chunk and a 157 KB SVG before starting a 2.8 s
//   drawing. Measured on the live site (simulated mid-range phone, 6 loads):
//   the alebrije appeared at 1.7–2.7 s, was on screen for 0.3–1.3 s, never
//   finished drawing, and on one load never appeared. Now every step waits for
//   the one before it; the morph cannot start until the drawing has finished.
//
// ★ MODES
//   full  — a fresh visit: the whole intro.
//   quick — back from another page of the site: the alebrije appears drawn,
//           then the same morph, without the wait.
//   none  — prefers-reduced-motion: straight to the page.
//   A tab opened in the background waits until it is actually shown.
//
// ★ IT ALWAYS ENDS. Every wait is capped, and a watchdog clears the overlay
//   if anything stalls, so the intro can never sit over the page.
// ─────────────────────────────────────────────────────────────────────
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAnimation } from "framer-motion";
import { EASE, INTRO, SPLASH, TIMING } from "@/lib/introConstants";

export type IntroMode = "full" | "quick" | "none";

/** Fired on window when the intro has finished (or was skipped). */
export const INTRO_DONE_EVENT = "olivea:intro-done";

/** True while the home intro is on screen (other UI can wait for it). */
export function isIntroPlaying(): boolean {
  return document.documentElement.dataset.intro === "playing";
}

function announceIntroDone() {
  if (!isIntroPlaying()) return;
  delete document.documentElement.dataset.intro;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

function nextFrame(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("aborted", "AbortError"));
    requestAnimationFrame(() => resolve());
  });
}

function whenVisible(signal: AbortSignal): Promise<void> {
  if (!document.hidden) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onChange = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onChange);
      resolve();
    };
    document.addEventListener("visibilitychange", onChange);
    signal.addEventListener(
      "abort",
      () => {
        document.removeEventListener("visibilitychange", onChange);
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

/** Back from another page of this site (logo click or in-site navigation). */
function isInternalReturn(): boolean {
  try {
    if (sessionStorage.getItem("olivea:returning") === "1") {
      sessionStorage.removeItem("olivea:returning");
      return true;
    }
    const prev = sessionStorage.getItem("prevPath");
    return !!prev && /^\/(es|en|casa|farmtotable|cafe)(\/|$)/.test(prev);
  } catch {
    return false;
  }
}

/* ── LCP base layer: demote once the hero has painted ─────────────── */

function useLcpDemote() {
  const [hideBase, setHideBase] = useState(false);

  useEffect(() => {
    document.body.classList.remove("lcp-demote");
    let lcpSeen = false;
    let minHold = false;
    let done = false;
    const routeT0 = performance.now();

    const maybeDemote = () => {
      if (done || !lcpSeen || !minHold) return;
      done = true;
      setHideBase(true);
      document.body.classList.add("lcp-demote");
      po?.disconnect();
    };

    const minTimer = setTimeout(() => {
      minHold = true;
      maybeDemote();
    }, 300);
    const lcpBackup = setTimeout(() => {
      lcpSeen = true;
      maybeDemote();
    }, 1200);

    let po: PerformanceObserver | null = null;
    try {
      if (PerformanceObserver.supportedEntryTypes?.includes("largest-contentful-paint")) {
        po = new PerformanceObserver((list) => {
          if (list.getEntries().some((e) => e.startTime >= routeT0 - 50)) {
            lcpSeen = true;
            maybeDemote();
          }
        });
        po.observe({ type: "largest-contentful-paint", buffered: true });
      } else {
        lcpSeen = true;
      }
    } catch {
      lcpSeen = true;
    }

    return () => {
      po?.disconnect();
      clearTimeout(minTimer);
      clearTimeout(lcpBackup);
    };
  }, []);

  return hideBase;
}

/* ── Desktop hero video: keep trying to play ─────────────────────── */

function useDesktopAutoplay(isMobile: boolean, videoRef: React.RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const v = videoRef.current;
    if (isMobile || !v) return;
    v.muted = true;
    v.playsInline = true;
    const tryPlay = () => void v.play().catch(() => {});
    if (v.readyState >= HTMLMediaElement.HAVE_METADATA) tryPlay();
    const onVisible = () => {
      if (!document.hidden) tryPlay();
    };
    v.addEventListener("loadedmetadata", tryPlay, { once: true });
    v.addEventListener("canplay", tryPlay, { once: true });
    window.addEventListener("touchstart", tryPlay, { once: true, passive: true });
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      v.removeEventListener("loadedmetadata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isMobile, videoRef]);
}

/* ── The intro ───────────────────────────────────────────────────── */

export function useIntroAnimation(isMobile: boolean) {
  const overlayControls = useAnimation();
  const logoControls = useAnimation();
  const logoBobControls = useAnimation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const heroBoxRef = useRef<HTMLDivElement>(null);
  const logoTargetRef = useRef<HTMLDivElement>(null);

  // `null` until the browser has decided; the server renders the green screen
  // alone, so the first client render matches it.
  const [mode, setMode] = useState<IntroMode | null>(null);
  const [introActive, setIntroActive] = useState(true);
  const [overlayGone, setOverlayGone] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [loaderHidden, setLoaderHidden] = useState(false);

  const hideBase = useLcpDemote();
  useDesktopAutoplay(isMobile, videoRef);

  // The drawing reports back through this; the sequence awaits it.
  const drawnRef = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  if (drawnRef.current === null) {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    drawnRef.current = { promise, resolve };
  }
  const onAlebrijeDrawn = useCallback(() => drawnRef.current?.resolve(), []);

  // Latest viewport class for the sequence, without restarting it.
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chosen: IntroMode = reduce ? "none" : isInternalReturn() ? "quick" : "full";
    // A one-time decision that needs the browser (media query, sessionStorage).
    setMode(chosen);

    const finish = () => {
      setOverlayGone(true);
      setShowSplash(false);
      setIntroActive(false);
      document.body.classList.remove("overflow-hidden");
      announceIntroDone();
    };

    if (chosen === "none") {
      finish();
      return;
    }
    document.documentElement.dataset.intro = "playing";

    const controller = new AbortController();
    const { signal } = controller;
    document.body.classList.add("overflow-hidden");

    const drawCapMs =
      chosen === "full" ? SPLASH.drawSec * 1000 + SPLASH.drawGraceMs : SPLASH.drawGraceMs;
    const watchdog = setTimeout(() => {
      controller.abort();
      finish();
    }, drawCapMs + INTRO.afterDrawWatchdogMs);

    const run = async () => {
      await whenVisible(signal);
      // The splash mounts on the render after setMode; its controls may only
      // be started once it exists.
      await nextFrame(signal);
      await nextFrame(signal);
      // Gentle idle bob while the alebrije draws.
      void logoBobControls.start({
        y: [0, -6, 0],
        transition: { duration: SPLASH.bobSec, repeat: Infinity, ease: "easeInOut" },
      });

      await Promise.race([drawnRef.current!.promise, sleep(drawCapMs, signal)]);
      if (chosen === "full") await sleep(SPLASH.holdMs, signal);

      const hero = heroBoxRef.current;
      if (!hero) return finish();

      // The loader bars leave first: inside the shrinking box they would be
      // squashed into a sliver.
      setLoaderHidden(true);
      logoBobControls.stop();
      await Promise.all([
        logoBobControls.start({ y: 0, transition: { duration: SPLASH.barFadeSec } }),
        sleep(SPLASH.barFadeSec * 1000, signal),
      ]);

      // Where everything ends up. On a desktop the alebrije lands on the logo
      // above the cards; on a phone (no such slot) it settles in the middle of
      // the hero, sized to sit inside it.
      await nextFrame(signal);
      const rect = hero.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const slot = logoTargetRef.current?.getBoundingClientRect();
      const landsOnSlot = !isMobileRef.current && !!slot && slot.width > 0;
      const target = landsOnSlot
        ? { cx: slot.left + slot.width / 2, cy: slot.top + slot.height / 2, scale: slot.width / SPLASH.sizePx }
        : {
            cx: rect.left + rect.width / 2,
            cy: rect.top + rect.height / 2,
            scale: Math.min(rect.height * SPLASH.heroFit, rect.width * SPLASH.heroFit) / SPLASH.sizePx,
          };

      // ONE movement: the green box and the alebrije shrink together, with the
      // same duration and easing, so the alebrije never spills out of the box.
      const move = { duration: TIMING.morphSec, ease: EASE.inOut };
      await Promise.all([
        overlayControls.start({
          clipPath: `inset(${Math.max(0, rect.top)}px ${Math.max(0, vw - rect.right)}px ${Math.max(
            0,
            vh - rect.bottom
          )}px ${Math.max(0, rect.left)}px round 24px)`,
          transition: move,
        }),
        logoControls.start({ top: target.cy, left: target.cx, scale: target.scale, transition: move }),
      ]);
      await sleep(TIMING.settleMs, signal);

      // Then one fade. On a desktop the alebrije sits exactly on the logo, so
      // only the green leaves; on a phone the green and the alebrije leave
      // together, revealing the photo and the title.
      setOverlayGone(true);
      const fade = { duration: TIMING.crossfadeSec, ease: EASE.out };
      await Promise.all([
        overlayControls.start({ opacity: 0, transition: fade }),
        landsOnSlot ? Promise.resolve() : logoControls.start({ opacity: 0, transition: fade }),
      ]);
      if (landsOnSlot) {
        await logoControls.start({ opacity: 0, transition: { duration: SPLASH.fadeOutSec, ease: EASE.out } });
      }
      finish();
    };

    run()
      .catch((e) => {
        if (!isAbort(e)) finish();
      })
      .finally(() => clearTimeout(watchdog));

    return () => {
      controller.abort();
      clearTimeout(watchdog);
      overlayControls.stop();
      logoControls.stop();
      logoBobControls.stop();
      document.body.classList.remove("overflow-hidden");
      announceIntroDone();
    };
  }, [overlayControls, logoControls, logoBobControls]);

  return {
    mode,
    videoRef,
    heroBoxRef,
    logoTargetRef,
    overlayControls,
    logoControls,
    logoBobControls,
    onAlebrijeDrawn,
    showSplash: showSplash && mode !== null && mode !== "none",
    introActive,
    overlayGone,
    loaderHidden,
    hideBase,
  };
}
