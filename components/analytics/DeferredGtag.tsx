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
// It loads a moment after the visitor's first scroll, tap or key, or after a
// few idle seconds, whichever comes first. On the home page never before the
// intro has finished: it was downloading while the alebrije drew.
//
// "A moment after", not on the tap itself: the first tap is often the phone
// menu, and running 194 KB of script while its circle opened froze the
// reveal for ~180 ms. Whatever the first interaction starts gets to finish.
// ─────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { INTRO_DONE_EVENT, isIntroPlaying } from "@/hooks/useIntroAnimation";

const SRC = "https://www.googletagmanager.com/gtag/js?id=G-M3JEDWZ732";
const IDLE_FALLBACK_MS = 4000;
// After the first interaction, long enough for what it started (the menu
// reveal is ~0.5 s) to finish.
const AFTER_ENGAGE_MS = 1200;
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

    let engaged = false;
    const onEngage = () => {
      if (engaged) return;
      engaged = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(load, AFTER_ENGAGE_MS);
    };

    const opts = { passive: true, capture: true, once: true } as const;
    const arm = () => {
      ENGAGE.forEach((e) => window.addEventListener(e, onEngage, opts));
      timer = window.setTimeout(load, IDLE_FALLBACK_MS);
    };

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener(INTRO_DONE_EVENT, arm);
      ENGAGE.forEach((e) => window.removeEventListener(e, onEngage, opts));
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
