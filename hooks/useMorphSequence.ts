// hooks/useMorphSequence.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, type RefObject } from "react";
import { TIMING, SPLASH, EASE } from "@/lib/introConstants";

type MotionControls = {
  start: (definition: any, transitionOverride?: any) => Promise<any>;
  stop: () => void;
};

export function useMorphSequence(
  hideBase: boolean,
  introStarted: boolean,
  heroBoxRef: RefObject<HTMLDivElement | null>,
  logoTargetRef: RefObject<HTMLDivElement | null>,
  overlayControls: MotionControls,
  innerScaleControls: MotionControls,
  logoControls: MotionControls,
  logoBobControls: MotionControls,
  setOverlayGone: (gone: boolean) => void,
  setShowLoader: (show: boolean) => void,
  setIntroStarted: (started: boolean) => void
) {
  useEffect(() => {
    if (!hideBase || !introStarted) return;

    const heroEl = heroBoxRef.current;
    const logoEl = logoTargetRef.current;
    if (!heroEl || !logoEl) return;

    const waitNextFrame = () => new Promise<void>((res) => requestAnimationFrame(() => res()));
    const isSafari =
      typeof navigator !== "undefined" &&
      /safari/i.test(navigator.userAgent) &&
      !/chrome|android/i.test(navigator.userAgent);

    (async () => {
      await waitNextFrame();

      // READ
      const rect = heroEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const t = Math.max(0, rect.top);
      const l = Math.max(0, rect.left);
      const r = Math.max(0, vw - rect.right);
      const b = Math.max(0, vh - rect.bottom);
      const scaleX = rect.width / vw;
      const scaleY = rect.height / vh;
      const x = rect.left + rect.width / 2 - vw / 2;
      const y = rect.top + rect.height / 2 - vh / 2;

      // WRITE morph
      await waitNextFrame();
      await Promise.all([
        overlayControls.start({
          clipPath: `inset(${t}px ${r}px ${b}px ${l}px round 24px)`,
          transition: { duration: TIMING.morphSec, ease: EASE.inOut },
        }),
        innerScaleControls.start({
          x,
          y,
          scaleX,
          scaleY,
          transition: { duration: TIMING.morphSec, ease: EASE.inOut },
        }),
      ]);

      await new Promise((res) => setTimeout(res, TIMING.settleMs));
      await waitNextFrame();

      const pad = logoEl.getBoundingClientRect();
      logoBobControls.stop();
      await logoBobControls.start({ y: 0, transition: { duration: 0.2 } });

      await logoControls.start({
        top: pad.top + pad.height / 2 + window.scrollY,
        left: pad.left + pad.width / 2 + window.scrollX,
        x: "-50%",
        y: "-50%",
        scale: pad.width / 240,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      });

      // ⬇️ extra paint + tiny Safari guard before fading overlay
      await waitNextFrame();
      if (isSafari) await new Promise((res) => setTimeout(res, 24));

      await overlayControls.start({
        opacity: 0,
        transition: { duration: TIMING.crossfadeSec, ease: EASE.out },
      });

      setOverlayGone(true);

      await new Promise((res) => setTimeout(res, SPLASH.afterCrossfadeMs));
      logoControls.start({
        opacity: 0,
        transition: { duration: SPLASH.fadeOutSec, ease: EASE.out },
      });
      await new Promise((res) => setTimeout(res, SPLASH.fadeOutSec * 1000));

      setShowLoader(false);
      setIntroStarted(false);
    })();
  }, [
    hideBase,
    introStarted,
    heroBoxRef,
    logoTargetRef,
    overlayControls,
    innerScaleControls,
    logoControls,
    logoBobControls,
    setOverlayGone,
    setShowLoader,
    setIntroStarted,
  ]);
}