// hooks/useLayoutMode.ts
"use client";

import { useEffect, useState } from "react";

export type LayoutMode = "mobile" | "tablet" | "desktop";

/**
 * A small, reliable 3-tier layout mode:
 * - mobile: < 768
 * - tablet: 768–1023
 * - desktop: >= 1024
 *
 * Adjust breakpoints if your Tailwind config differs.
 */
export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>("mobile");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      if (w < 768) setMode("mobile");
      else if (w < 1024) setMode("tablet");
      else setMode("desktop");
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return mode;
}