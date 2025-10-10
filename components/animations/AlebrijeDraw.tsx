// components/animations/AlebrijeDraw.tsx
"use client";

import { useEffect, useRef } from "react";
import Alebrije1 from "@/assets/alebrije-1.svg";

type GsapContextLike = { revert(): void };

interface Props {
  size?: number;                 // px
  strokeDuration?: number;       // seconds (2.4–3.2 calm)
  microStaggerEach?: number;     // 0 or ~0.001–0.002 for whisper cascade
  onComplete?: () => void;
}

/**
 * Smooth “draw”:
 * - SVG starts hidden on first paint (SSR-safe)
 * - prepare dash (L L, offset L)
 * - tiny stroke fade-in + constant-speed reveal
 */
export default function AlebrijeDraw({
  size = 1000,
  strokeDuration = 2.8,
  microStaggerEach = 0,
  onComplete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: GsapContextLike | undefined;
    let raf1 = 0;
    let raf2 = 0;

    const start = async () => {
      const { default: gsap } = await import("gsap");

      const el = containerRef.current;
      if (!el) return;

      const svg = el.querySelector<SVGSVGElement>("svg");
      if (!svg) return;

      // Keep hidden until fully prepared (we also set it inline at render)
      svg.setAttribute("shape-rendering", "geometricPrecision");

      const raw = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
      if (!raw.length) return;

      // Measure once
      const pairs = raw.map((p) => [p, p.getTotalLength()] as const);

      // Filter microscopic segments that create visual “ticks”
      const MIN_LEN = 0.5;
      const filtered = pairs.filter(([, L]) => L >= MIN_LEN);
      if (!filtered.length) return;

      // Prepare reveal
      for (const [p, L] of filtered) {
        p.setAttribute("vector-effect", "non-scaling-stroke");
        p.style.strokeLinecap = "round";
        p.style.strokeLinejoin = "round";
        p.style.strokeMiterlimit = "1";
        p.style.strokeDasharray = `${L} ${L}`;
        p.style.strokeDashoffset = `${L}`;
        p.style.fillOpacity = "0";
        p.style.strokeOpacity = "0";  // fade-in strokes, not container
        p.style.willChange = "stroke-dashoffset, stroke-opacity";

        const color = getComputedStyle(p).fill;
        if (color && color !== "none") p.style.stroke = color;
        p.style.strokeWidth = ".3";
      }

      const elements = filtered.map(([p]) => p);

      // Ensure initial style is applied before showing svg
      gsap.set(elements, {
        strokeDashoffset: (_i, _t, targets) =>
          (targets[_i] as SVGPathElement).style.strokeDashoffset,
      });

      // Now that everything is prepped, show the svg and animate
      svg.style.visibility = "visible";

      ctx = (gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => onComplete?.(),
          defaults: { lazy: false },
        });

        // Soft on-ramp (no pop)
        tl.to(
          elements,
          {
            strokeOpacity: 1,
            duration: 0.18,
            ease: "power1.out",
          },
          0
        );

        // Constant-speed draw
        tl.to(
          elements,
          {
            strokeDashoffset: 0,
            duration: strokeDuration,
            ease: "none",
            autoRound: false,
            stagger: microStaggerEach ? { each: microStaggerEach, from: 0 } : 0,
          },
          0
        );
      }, el) as unknown) as GsapContextLike;
    };

    // Give layout two RAFs to settle (prevents initial batching artifacts)
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        void start();
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      ctx?.revert?.();
    };
  }, [strokeDuration, microStaggerEach, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, contain: "paint" }}
      className="flex items-center justify-center"
    >
      {/* SSR-safe: hidden on first paint to avoid a visible prepped/unprepped frame */}
      <Alebrije1 className="w-full h-full" style={{ visibility: "hidden" }} />
    </div>
  );
}
