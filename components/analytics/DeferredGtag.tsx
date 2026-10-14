"use client";

// components/analytics/DeferredGtag.tsx
// ─────────────────────────────────────────────────────────────────────
// Loads Google's gtag.js (≈194 KB, the largest file the site sends) once
// the page has been seen, not while it is appearing.
//
// The tiny inline `ga-init` snippet in the layout still runs early: it defines
// gtag(), sets Consent Mode defaults and queues the page view in dataLayer.
// gtag.js reads that queue whenever it arrives, so nothing is lost by waiting.
//
// It loads on the visitor's first scroll, tap or key, or after a few idle
// seconds, whichever comes first. On the home page never before the intro
// has finished: it was downloading while the alebrije drew.
// ─────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { INTRO_DONE_EVENT, isIntroPlaying } from "@/hooks/useIntroAnimation";

const SRC = "https://www.googletagmanager.com/gtag/js?id=G-M3JEDWZ732";
const IDLE_FALLBACK_MS = 4000;
const ENGAGE = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

export default function DeferredGtag() {
  useEffect(() => {
    let loaded = false;
    let timer = 0;

    const load = () => {
      if (loaded) return;
      loaded = true;
      cleanup();
      if (document.querySelector(`script[src="${SRC}"]`)) return;
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      document.head.appendChild(s);
    };

    const opts = { passive: true, capture: true, once: true } as const;
    const arm = () => {
      ENGAGE.forEach((e) => window.addEventListener(e, load, opts));
      timer = window.setTimeout(load, IDLE_FALLBACK_MS);
    };

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener(INTRO_DONE_EVENT, arm);
      ENGAGE.forEach((e) => window.removeEventListener(e, load, opts));
    }

    // The intro flag is set by the home page's own effect, which runs after
    // this one; check on the next frame.
    const raf = requestAnimationFrame(() => {
      if (isIntroPlaying()) window.addEventListener(INTRO_DONE_EVENT, arm, { once: true });
      else arm();
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return null;
}
