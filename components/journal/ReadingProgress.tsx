// components/journal/ReadingProgress.tsx
"use client";

import { useEffect, useRef } from "react";

/**
 * Reading-progress bar that updates via direct DOM writes (no React state / re-renders).
 */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight || document.body.scrollHeight;
      const clientHeight = el.clientHeight;
      const max = Math.max(1, scrollHeight - clientHeight);
      const p = Math.min(1, Math.max(0, scrollTop / max));

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = 0;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-60 h-0.5 w-full bg-transparent">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-black/70 dark:bg-white/70"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
