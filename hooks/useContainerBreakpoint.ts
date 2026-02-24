// hooks/useContainerBreakpoint.ts
"use client";

import { useEffect, useState } from "react";

export function useContainerMobileLike(
  ref: React.RefObject<HTMLElement | null>,
  thresholdPx = 960
) {
  const [isMobileLike, setIsMobileLike] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const w = el.getBoundingClientRect().width;
      setIsMobileLike(w > 0 && w < thresholdPx);
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);

    window.addEventListener("resize", compute, { passive: true });
    window.addEventListener("orientationchange", compute, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [ref, thresholdPx]);

  return isMobileLike;
}