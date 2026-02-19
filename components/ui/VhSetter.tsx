// components/ui/VhSetter.tsx
"use client";

import { useEffect } from "react";

function setVhVar() {
  const vh = (window.visualViewport?.height ?? window.innerHeight) * 0.01;
  document.documentElement.style.setProperty("--app-vh", `${vh}px`);
}

export default function VhSetter() {
  useEffect(() => {
    setVhVar();

    const onResize = () => setVhVar();

    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return null;
}
