// components/ui/VhSetter.tsx
"use client";

import { useEffect } from "react";

function computeVhPxRounded() {
  const h = window.visualViewport?.height ?? window.innerHeight;
  // round to 0.1px to avoid tiny oscillations causing style writes
  return Math.round(h * 0.01 * 10) / 10;
}

export default function VhSetter() {
  useEffect(() => {
    let raf = 0;
    let last = NaN;

    const apply = () => {
      raf = 0;
      const vh = computeVhPxRounded();
      if (vh === last) return;
      last = vh;
      document.documentElement.style.setProperty("--app-vh", `${vh}px`);
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    };

    apply();

    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.addEventListener("pageshow", schedule);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);

      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);

      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, []);

  return null;
}