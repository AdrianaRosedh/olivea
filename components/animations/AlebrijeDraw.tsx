// components/animations/AlebrijeDraw.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Props {
  size?: number; // px
  strokeDuration?: number; // seconds (2.4–3.2 calm)
  microStaggerEach?: number; // 0 or ~0.001–0.002 for whisper cascade
  onComplete?: () => void;
  /**
   * Public SVG path to load and animate.
   * Defaults to your brand asset.
   */
  src?: string;

  /**
   * Extra breathing room so strokes never clip.
   * (Only affects wrapper box, not the SVG itself.)
   */
  bleedPx?: number;
}

/**
 * WAAPI “draw”:
 * - SSR-safe (SVG hidden until prepared)
 * - dasharray/dashoffset reveal
 * - fade-in stroke + constant-speed draw
 * - reduced-motion aware
 * - fallback if WAAPI isn't available on SVGElement
 *
 * NOTE: SVG is loaded from /public via fetch() and injected as inline markup
 * so paths are available for animation (cannot animate <img>/<Image> SVG contents).
 */
export default function AlebrijeDraw({
  size = 1000,
  strokeDuration = 2.8,
  microStaggerEach = 0,
  onComplete,
  src = "/brand/alebrije-1.svg",
  bleedPx = 8,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Cache lengths per instance
  const lengthsRef = useRef<WeakMap<SVGPathElement, number>>(new WeakMap());

  // Load SVG from public
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(src, { cache: "force-cache" });
        if (!res.ok) throw new Error(`Failed to load SVG: ${src} (${res.status})`);
        const text = await res.text();
        if (!cancelled) setSvgMarkup(text);
      } catch {
        if (!cancelled) setSvgMarkup(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const el = containerRef.current;
    const svg = el?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;

    // ✅ Make injected SVG behave like a centered responsive asset
    // Remove fixed sizing that can distort/crop inside the wrapper
    svg.removeAttribute("width");
    svg.removeAttribute("height");

    // Ensure it scales to the wrapper
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";
    svg.style.overflow = "visible"; // important for strokes near edges

    // Center it the same way as your HomeClient/logo usage
    if (!svg.getAttribute("preserveAspectRatio")) {
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }

    // If your SVG has no viewBox (rare, but possible), attempt to derive one
    // so scaling behaves predictably.
    if (!svg.getAttribute("viewBox")) {
      // try to infer from bounding box after insertion
      try {
        const bb = svg.getBBox();
        if (bb.width > 0 && bb.height > 0) {
          svg.setAttribute("viewBox", `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
        }
      } catch {
        // ignore
      }
    }

    // Reduced motion: just show
    if (reduceMotion) {
      svg.style.visibility = "visible";
      onComplete?.();
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    let cancelled = false;

    const anims: Animation[] = [];

    const cleanup = () => {
      cancelled = true;
      anims.forEach((a) => {
        try {
          a.cancel();
        } catch {}
      });
    };

    const prepAndAnimate = () => {
      if (cancelled) return;

      svg.setAttribute("shape-rendering", "geometricPrecision");

      const rawPaths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
      if (!rawPaths.length) {
        svg.style.visibility = "visible";
        onComplete?.();
        return;
      }

      // Measure & filter
      const MIN_LEN = 0.5;
      const paths: Array<{ p: SVGPathElement; L: number }> = [];

      for (const p of rawPaths) {
        const cached = lengthsRef.current.get(p);
        const L = typeof cached === "number" ? cached : p.getTotalLength();
        if (typeof cached !== "number") lengthsRef.current.set(p, L);
        if (L >= MIN_LEN) paths.push({ p, L });
      }

      if (!paths.length) {
        svg.style.visibility = "visible";
        onComplete?.();
        return;
      }

      // If WAAPI isn't supported, just reveal
      const waapiOk = typeof paths[0]?.p.animate === "function";
      if (!waapiOk) {
        for (const { p } of paths) {
          p.style.fillOpacity = "0";
          p.style.strokeOpacity = "1";
        }
        svg.style.visibility = "visible";
        onComplete?.();
        return;
      }

      // Prepare styles
      for (const { p, L } of paths) {
        p.setAttribute("vector-effect", "non-scaling-stroke");
        p.style.strokeLinecap = "round";
        p.style.strokeLinejoin = "round";
        p.style.strokeMiterlimit = "1";

        p.style.strokeDasharray = `${L} ${L}`;
        p.style.strokeDashoffset = `${L}`;
        p.style.fillOpacity = "0";
        p.style.strokeOpacity = "0";
        p.style.willChange = "stroke-dashoffset, stroke-opacity";

        const fill = getComputedStyle(p).fill;
        if (
          fill &&
          fill !== "none" &&
          !fill.includes("rgba(0,0,0,0)") &&
          !fill.includes("rgba(0, 0, 0, 0)")
        ) {
          p.style.stroke = fill;
        }

        p.style.strokeWidth = ".3";
      }

      // Show after prep
      svg.style.visibility = "visible";

      const durMs = Math.max(0, Math.round(strokeDuration * 1000));
      const fadeMs = 180;
      const eachDelayMs = microStaggerEach
        ? Math.max(0, Math.round(microStaggerEach * 1000))
        : 0;

      let finished = 0;
      const total = paths.length;

      const markDone = () => {
        finished += 1;
        if (finished >= total && !cancelled) onComplete?.();
      };

      paths.forEach(({ p, L }, i) => {
        const delay = eachDelayMs * i;

        const a1 = p.animate([{ strokeOpacity: 0 }, { strokeOpacity: 1 }], {
          duration: fadeMs,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          delay,
          fill: "forwards",
        });

        const a2 = p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], {
          duration: durMs,
          easing: "linear",
          delay,
          fill: "forwards",
        });

        a2.onfinish = () => markDone();

        anims.push(a1, a2);
      });
    };

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        prepAndAnimate();
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      cleanup();
    };
  }, [strokeDuration, microStaggerEach, onComplete, reduceMotion, svgMarkup]);

  // ✅ IMPORTANT:
  // - remove `contain: paint` to prevent clipping
  // - allow overflow so strokes can breathe
  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center overflow-visible"
      style={{
        width: size,
        height: size,
        // safer containment (no paint clipping)
        contain: "layout style",
        // give a little breathing room so nothing hits the edge
        padding: bleedPx,
        boxSizing: "border-box",
      }}
    >
      {svgMarkup ? (
        <div
          className="absolute inset-0"
          style={{ visibility: "hidden", overflow: "visible" }}
          // controlled asset (your own SVG), used intentionally for animation
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : null}
    </div>
  );
}