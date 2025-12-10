"use client";
import { useRef, useEffect } from "react";

export default function IntroBarFixed() {
  const percentRef = useRef<HTMLSpanElement>(null);
  const barBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const duration = isMobile ? 1800 : 3500;
    let rafId = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(now - t0, duration);
      const pct = Math.floor((elapsed / duration) * 100);
      if (percentRef.current) {
        percentRef.current.textContent = `${pct}%`;
      }
      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    // Set CSS custom property for animation duration
    barBoxRef.current?.style.setProperty("--bar-duration", `${duration / 1000}s`);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="fixed bottom-20 left-12 right-12 hidden md:flex items-center z-50 text-[#e7eae1] text-xl font-semibold pointer-events-auto select-none not-italic">
      <span>Donde el Huerto es la Esencia</span>
      <div
        ref={barBoxRef}
        className="flex-1 h-2 rounded-full mx-6 relative overflow-hidden"
        style={{ backgroundColor: "#e7eae120" }}
      >
        <div className="loader-bar bg-[#e7eae1]" />
      </div>
      <span ref={percentRef}>0%</span>
    </div>
  );
}
