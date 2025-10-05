"use client";

import { useEffect, useRef } from "react";

/**
 * Ensures the last `.subsection` can center with the given top offset,
 * and then the page stops (no extra blank scroll).
 */
export default function ScrollLimiter({
  topOffsetPx = 120,
  anchorSelector = ".subsection",
  children,
  className = "",
}: {
  topOffsetPx?: number;
  anchorSelector?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function recompute() {
      const root = ref.current;
      if (!root) return;

      const anchors = Array.from(document.querySelectorAll<HTMLElement>(anchorSelector));
      const last = anchors[anchors.length - 1];
      if (!last) return;

      const vh = window.innerHeight;
      const h  = Math.max(last.offsetHeight, 1);

      // padding that allows centering the last block, then no extra
      const pad = h <= vh ? Math.max(0, (vh - h) / 2 + topOffsetPx) : Math.max(0, topOffsetPx);
      root.style.paddingBottom = `${Math.ceil(pad)}px`;
    }

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(document.documentElement);
    window.addEventListener("resize", recompute);
    // Recompute when fonts/images settle
    const tm = setTimeout(recompute, 200);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
      clearTimeout(tm);
    };
  }, [topOffsetPx, anchorSelector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
