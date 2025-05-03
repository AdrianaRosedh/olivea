// components/animations/NextGenBackground.tsx
"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/ScrollProvider";

export default function NextGenBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const lenis    = useLenis();

  const updateGradient = (scrollY: number) => {
    if (!layerRef.current) return;
    const progress = Math.min(scrollY / 1000, 1);

    const opacity    = progress < 0.01 || progress > 0.99 ? 0.8 : 1;
    const hue        = 20 + (progress < 0.5 ? progress * 50 : (1 - progress) * 50);
    const saturation = 90 - progress * 60 + (progress > 0.5 ? (progress - 0.5) * 100 : 0);
    const brightness = 85 + progress * 40 - (progress > 0.5 ? (progress - 0.5) * 90 : 0);

    layerRef.current.style.opacity = String(opacity);
    layerRef.current.style.filter  = `
      hue-rotate(${hue}deg)
      saturate(${saturation}%)
      brightness(${brightness}%)
    `;
  };

  useEffect(() => {
    // subscribe
    const onScroll = ({ scroll }: { scroll: number }) => {
      updateGradient(scroll);
    };
    lenis.on("scroll", onScroll);

    // initial render
    updateGradient(window.scrollY);

    return () => {
      // unsubscribe
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--olivea-cream)] to-[var(--olivea-shell)]" />
      <div
        ref={layerRef}
        className="absolute inset-0 bg-gradient-to-br from-[#e8e4d5] via-[#e0d9c5] to-[#d5ceb8]" 
        style={{
          opacity:    0.8,
          filter:     "hue-rotate(20deg) saturate(90%) brightness(85%)",
          transition: "filter 0.3s ease-out, opacity 0.3s ease-out",
        }}
      />
      <div className="absolute inset-0 bg-radial-gradient opacity-40 pointer-events-none" />
    </div>
  );
}