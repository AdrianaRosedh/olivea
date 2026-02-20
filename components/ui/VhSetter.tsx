// components/ui/VhSetter.tsx
"use client";

import { useEffect } from "react";

function computeVhPx() {
  const h = window.visualViewport?.height ?? window.innerHeight;
  return h * 0.01;
}

export default function VhSetter() {
  useEffect(() => {
    let raf = 0;

    const apply = () => {
      raf = 0;
      const vh = computeVhPx();
      document.documentElement.style.setProperty("--app-vh", `${vh}px`);
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(apply);
    };

    // run once immediately
    apply();

    // viewport changes (address bar show/hide, keyboard, etc.)
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);

    // fallback signals
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