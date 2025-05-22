"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

// Single-SVG draw & fill component for alebrije-1
import Alebrije1 from "@/assets/alebrije-1.svg";

interface Props {
  size?: number;             // container size in px
  strokeDuration?: number;   // seconds to draw strokes
  fillDuration?: number;     // seconds to fade fills
  fillDelay?: number;        // seconds to wait before fading fills
  onComplete?: () => void;   // optional callback when animation finishes
}

export default function AlebrijeDraw({
  size = 1000,
  strokeDuration = 150,
  fillDuration = 200,
  fillDelay = 4,
  onComplete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const el = containerRef.current;
      if (!el) return;

      // find SVG and its paths
      const svg = el.querySelector<SVGSVGElement>("svg");
      if (!svg) return;

      const paths = Array.from(
        svg.querySelectorAll<SVGPathElement>("path")
      );
      if (!paths.length) return;

      // prepare each path: dash setup, fill setup, stroke style
      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.setAttribute("vector-effect", "non-scaling-stroke");
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        const computedFill = window.getComputedStyle(path).fill;
        path.setAttribute("fill", computedFill);
        path.style.fillOpacity = "0";

        path.style.stroke = computedFill;
        path.style.strokeWidth = ".3";
      });

      // create a timeline for better control
      const tl = gsap.timeline({
        onComplete: () => onComplete?.(),
      });

      // draw the strokes
      tl.to(paths, {
        strokeDashoffset: 0,
        duration: strokeDuration,
        ease: "power1.inOut",
      });

      // fade in fills after optional delay
      tl.to(
        paths,
        {
          fillOpacity: 1,
          duration: fillDuration,
          ease: "power1.inOut",
        },
        `+=${fillDelay}`
      );
    }, containerRef);

    return () => ctx.revert();
  }, [strokeDuration, fillDuration, fillDelay, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      <Alebrije1 className="w-full h-full" />
    </div>
  );
}
