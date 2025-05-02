"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Single-SVG draw & fill component for alebrije-1
import Alebrije1 from "@/assets/alebrije-1.svg";

interface Props {
  size?: number;             // container size in px
  strokeDuration?: number;   // seconds to draw strokes
  fillDuration?: number;     // seconds to fade fills
}

export default function AlebrijeDraw({
  size = 1000,
  strokeDuration = 30,
  fillDuration = 40,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // find SVG and its paths
    const svg = el.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    // prevent stroke scaling
    svg.style.vectorEffect = "non-scaling-stroke";

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    if (!paths.length) return;

    // prepare each path: hide stroke & fill, set thin stroke
    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.fillOpacity = "0";
      // capture computed fill color
      const computedFill = window.getComputedStyle(path).fill;
      // hide fill during draw
      path.setAttribute("fill", "none");
      // apply stroke of that color
      path.style.stroke = computedFill;
      // thinner stroke width
      path.style.strokeWidth = ".3";
    });

    // draw strokes
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: strokeDuration,
      ease: "power1.inOut",
    });

    // after stroke complete, fade in fill
    gsap.to(paths, {
      fill: (_, target) => (target as SVGPathElement).style.stroke,
      duration: fillDuration,
      ease: "power1.inOut",
      delay: strokeDuration,
      onStart: () => {
        // restore fill attribute so shape fills
        paths.forEach((path) => {
          path.setAttribute("fill", path.style.stroke);
        });
      },
    });
  }, [strokeDuration, fillDuration]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      {/* apply non-scaling-stroke here too for some browsers */}
      <Alebrije1 className="w-full h-full" style={{ vectorEffect: "non-scaling-stroke" }} />
    </div>
  );
}