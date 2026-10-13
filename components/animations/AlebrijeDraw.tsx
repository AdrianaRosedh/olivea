"use client";

// components/animations/AlebrijeDraw.tsx
// ─────────────────────────────────────────────────────────────────────
// Draws the alebrije line by line, then tells its owner it is finished.
//
// ★ ONE DOWNLOAD, SHARED. The SVG is fetched once per page load through
//   loadAlebrije() and the promise is kept at module level, so React's
//   development double-mount, a remount, or a second instance never fetches
//   again — and never ends up with nothing to draw. (The previous version
//   guarded with a ref that also cancelled its only fetch in development, so
//   the alebrije never appeared locally.) The home page preloads the same URL
//   in the document head, so the request starts with the HTML.
//
// ★ SCOPED. The source file carries a document-wide `.cls-1 { fill … !important }`
//   rule; injected as-is it would repaint any element on the page with that
//   (very common, Illustrator-default) class. The loader strips the <style>
//   and classes and sets the fill on each shape instead.
//
// ★ INSERTED BY THIS COMPONENT, NOT BY REACT. With dangerouslySetInnerHTML,
//   React re-inserted the markup after the drawing effect had styled it, so
//   the visible, animating copy was replaced by a fresh hidden one. React now
//   owns only an empty container; the effect parses the SVG and appends it.
//
// ★ EVERY SHAPE IS DRAWN: paths and polygons (both are SVGGeometryElement).
//
// ★ FINISHES EVEN WHEN IT CANNOT ANIMATE. Reduced motion, no Web Animations
//   API, or a failed download all report `onComplete` straight away, so the
//   intro never waits on a drawing that will not happen.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";


type Props = {
  size?: number;
  /** Seconds to draw every line. */
  strokeDuration?: number;
  /** Called once: when the drawing finishes, or at once if it cannot be drawn. */
  onComplete?: () => void;
  /** Skip the drawing and show the finished alebrije (e.g. a returning guest). */
  instant?: boolean;
  src?: string;
  /** Room around the drawing so strokes never clip at the edge. */
  bleedPx?: number;
};

const FILL = "#e7eae1";

const cache = new Map<string, Promise<string | null>>();

/** Fetch and clean an SVG once per page load; later calls share the promise. */
export function loadAlebrije(src: string): Promise<string | null> {
  let pending = cache.get(src);
  if (!pending) {
    pending = fetch(src, { cache: "force-cache" })
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => (text ? cleanSvg(text) : null))
      .catch(() => null);
    cache.set(src, pending);
  }
  return pending;
}

function cleanSvg(text: string): string | null {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg || doc.querySelector("parsererror")) return null;
  doc.querySelectorAll("style, script, foreignObject").forEach((n) => n.remove());
  svg.querySelectorAll("*").forEach((n) => {
    for (const attr of Array.from(n.attributes)) {
      if (attr.name.startsWith("on")) n.removeAttribute(attr.name);
    }
    n.removeAttribute("class");
  });
  svg.querySelectorAll("path, polygon").forEach((n) => n.setAttribute("fill", FILL));
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.removeAttribute("id");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  if (!svg.getAttribute("preserveAspectRatio")) {
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }
  return new XMLSerializer().serializeToString(svg);
}

export default function AlebrijeDraw({
  size = 240,
  strokeDuration = 2.8,
  onComplete,
  instant = false,
  src = "/brand/alebrije-1.svg",
  bleedPx = 8,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [markup, setMarkup] = useState<string | null>(null);

  // The latest callback, without restarting the drawing when it changes.
  const onCompleteRef = useRef(onComplete);
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    let alive = true;
    loadAlebrije(src).then((svg) => {
      if (!alive) return;
      if (svg) setMarkup(svg);
      else onCompleteRef.current?.(); // nothing to draw: do not hold the intro
    });
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host || !markup) return;
    const parsed = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
    const svg = document.importNode(parsed, true) as unknown as SVGSVGElement;
    svg.style.visibility = "hidden";
    host.replaceChildren(svg);

    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";
    svg.style.overflow = "visible";

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onCompleteRef.current?.();
    };

    const shapes = Array.from(svg.querySelectorAll<SVGGeometryElement>("path, polygon"))
      .map((el) => ({ el, length: el.getTotalLength() }))
      .filter((s) => s.length >= 0.5);

    const canAnimate = shapes.length > 0 && typeof shapes[0].el.animate === "function";

    // Finished state: the line drawing, fully stroked.
    for (const { el } of shapes) {
      el.setAttribute("vector-effect", "non-scaling-stroke");
      el.style.stroke = FILL;
      el.style.strokeWidth = "0.3";
      el.style.strokeLinecap = "round";
      el.style.strokeLinejoin = "round";
      el.style.fillOpacity = "0";
    }

    if (instant || reduceMotion || !canAnimate) {
      svg.style.visibility = "visible";
      finish();
      return () => svg.remove();
    }

    for (const { el, length } of shapes) {
      el.style.strokeDasharray = `${length} ${length}`;
      el.style.strokeDashoffset = `${length}`;
    }
    svg.style.visibility = "visible";

    const duration = Math.max(0, Math.round(strokeDuration * 1000));
    const animations = shapes.flatMap(({ el, length }) => [
      el.animate([{ strokeOpacity: 0 }, { strokeOpacity: 1 }], {
        duration: 180,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      }),
      el.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
        duration,
        easing: "linear",
        fill: "forwards",
      }),
    ]);

    // All lines share one duration, so the last one to finish is the signal.
    Promise.all(animations.map((a) => a.finished)).then(finish, () => {});

    return () => {
      animations.forEach((a) => a.cancel());
      svg.remove();
    };
  }, [markup, instant, reduceMotion, strokeDuration]);

  return (
    <div
      className="relative flex items-center justify-center overflow-visible"
      style={{ width: size, height: size, padding: bleedPx, boxSizing: "border-box", contain: "layout style" }}
    >
      <div ref={containerRef} className="absolute inset-0" style={{ overflow: "visible" }} />
    </div>
  );
}
