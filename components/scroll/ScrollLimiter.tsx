"use client";

import { useEffect, useRef } from "react";

/**
 * Ensures the last visible anchor (default .subsection) can center with the
 * given top offset, and then the page stops (no extra blank scroll).
 *
 * Now considers existing space after the last anchor and a bottom UI offset.
 */
export default function ScrollLimiter({
  topOffsetPx = 120,          // e.g., navbar spacing you already use
  bottomOffsetPx = 0,         // e.g., mobile bottom bar / FAB cluster
  anchorSelector = ".subsection",
  children,
  className = "",
}: {
  topOffsetPx?: number;
  bottomOffsetPx?: number;
  anchorSelector?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function recompute() {
      const root = ref.current;
      if (!root) return;

      // Choose the last *visible* anchor (non-zero height and attached to layout)
      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>(anchorSelector)
      ).filter((el) => el.offsetParent !== null && el.offsetHeight > 0);

      const last = anchors[anchors.length - 1];
      if (!last) return;

      const vh = window.innerHeight;
      const lastH = Math.max(last.offsetHeight, 1);

      // Desired extra space below the last anchor so it can center:
      // If last block is shorter than viewport, we want half the remaining
      // viewport height + topOffset, minus whatever bottom UI occupies.
      const desiredPad =
        lastH <= vh
          ? Math.max(0, (vh - lastH) / 2 + topOffsetPx - bottomOffsetPx)
          : Math.max(0, topOffsetPx - bottomOffsetPx);

      // How much space already exists under the last anchor inside the root?
      // (root's scrollable height - bottom of last element within root)
      const lastBottomInRoot = last.offsetTop + last.offsetHeight;
      const existingSpace = Math.max(0, root.scrollHeight - lastBottomInRoot);

      // Only add the missing part; never add negative padding
      const padToAdd = Math.max(0, Math.ceil(desiredPad - existingSpace));
      root.style.paddingBottom = `${padToAdd}px`;
    }

    recompute();

    const ro = new ResizeObserver(recompute);
    ro.observe(document.documentElement);

    window.addEventListener("resize", recompute);

    // Recompute once fonts / images settle
    const tm = window.setTimeout(recompute, 200);

    // Optional: recompute after a few animation frames (parallax/layout settle)
    const raf1 = requestAnimationFrame(recompute);
    const raf2 = requestAnimationFrame(recompute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
      clearTimeout(tm);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [topOffsetPx, bottomOffsetPx, anchorSelector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}