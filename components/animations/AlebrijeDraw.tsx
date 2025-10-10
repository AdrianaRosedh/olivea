"use client";

import { useEffect, useRef } from "react";
import Alebrije1 from "@/assets/alebrije-1.svg";

type GsapContextLike = { revert(): void };

interface Props {
  size?: number;                 // px
  strokeDuration?: number;       // seconds (try 2.2–3.2 for a slower, calm draw)
  microStaggerEach?: number;     // seconds per path, e.g. 0 or 0.002 for a whisper cascade
  onComplete?: () => void;
}

export default function AlebrijeDraw({
  size = 1000,
  strokeDuration = 2.8,          // slower default
  microStaggerEach = 0,          // 0 = no stagger; set ~0.002 for subtle cascade
  onComplete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: GsapContextLike | undefined;

    const raf = requestAnimationFrame(async () => {
      const { default: gsap } = await import("gsap");

      const el = containerRef.current;
      if (!el) return;

      const svg = el.querySelector<SVGSVGElement>("svg");
      if (!svg) return;

      const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
      if (!paths.length) return;

      // ——— prep once, then animate ———
      const lengths = paths.map((p) => p.getTotalLength());

      paths.forEach((p, i) => {
        p.setAttribute("vector-effect", "non-scaling-stroke");
        // better joins/caps = visually smoother lines while drawing
        p.style.strokeLinecap = "round";
        p.style.strokeLinejoin = "round";
        p.style.strokeMiterlimit = "1";

        p.style.strokeDasharray = `${lengths[i]}`;
        p.style.strokeDashoffset = `${lengths[i]}`;

        // keep fill invisible; draw with the resolved (gold) fill color
        const color = window.getComputedStyle(p).fill;
        if (color && color !== "none") p.style.stroke = color;
        p.style.strokeWidth = ".3";
        p.style.fillOpacity = "0";
      });

      // Important: set initial state via gsap before animating (avoids a visible first tick)
      gsap.set(paths, { strokeDashoffset: (i) => lengths[i] });

      ctx = (gsap.context(() => {
        const tl = gsap.timeline({ onComplete: () => onComplete?.() });

        tl.to(paths, {
          strokeDashoffset: 0,
          duration: strokeDuration,
          ease: "none",            // constant speed = no “speed bumps” at easing bends
          autoRound: false,        // avoid integer snapping on tiny segments
          stagger: microStaggerEach
            ? { each: microStaggerEach, from: 0 }
            : 0,
        });
      }, el) as unknown) as GsapContextLike;
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert?.();
    };
  }, [strokeDuration, microStaggerEach, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        contain: "paint",           // isolate paints to this box (helps Safari/WebKit)
      }}
      className="flex items-center justify-center"
    >
      <Alebrije1 className="w-full h-full" />
    </div>
  );
}
