"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type MediaFallback = "previous" | "always" | "never";
type Options = {
  threshold?: number; // default 0.48
  deadband?: number; // default 0.03
  mediaFallback?: MediaFallback; // default "previous"
  sampleUnderNavPx?: number; // default 8
};

/**
 * Updated for:
 * - Stable `check` (no listener churn on isDark flips)
 * - Avoid per-sample DOM creation (reuse one scratch element)
 * - Reduce false "media" classification (remove broad querySelector)
 * - Ignore elements inside the navbar itself (node.contains)
 * - Unified rAF tick guard for all triggers
 */
export function useBackgroundColorDetection(opts: Options = {}) {
  const {
    threshold = 0.48,
    deadband = 0.03,
    mediaFallback = "previous",
    sampleUnderNavPx = 8,
  } = opts;

  const [isDark, setIsDark] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);

  // Refs to avoid re-creating handlers when isDark changes
  const isDarkRef = useRef(false);
  const lastLumaRef = useRef<number | null>(null);

  const tickingRef = useRef(false);
  const roRef = useRef<ResizeObserver | null>(null);

  // Reusable scratch element for color normalization (rarely used, but safer + cheaper)
  const scratchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  const toLuma = (r: number, g: number, b: number) => {
    const lin = (v: number) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };

  const parseRGBA = (s: string) => {
    const m = s.match(
      /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([.\d]+))?\s*\)/i
    );
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? +m[4] : 1 };
  };

  const isTransparent = (bg: string) =>
    !bg ||
    bg === "transparent" ||
    (/rgba\(/i.test(bg) && (parseRGBA(bg)?.a ?? 1) <= 0.01);

  // IMPORTANT: Keep this strict. The old `querySelector(...)` was too broad
  // and could misclassify normal UI that contains an svg/icon as "media".
  const looksLikeMedia = (el: Element) =>
    el.matches("img, picture, video, canvas, svg");

  const normalizeColorToRGB = (color: string): string | null => {
    // Most computed styles are already rgb/rgba. If so, return immediately.
    if (/^rgba?\(/i.test(color)) return color;

    // Rare fallback: normalize named colors/hex via a reusable scratch element.
    if (!scratchRef.current) {
      const tmp = document.createElement("div");
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      tmp.style.top = "-9999px";
      tmp.style.width = "1px";
      tmp.style.height = "1px";
      tmp.style.pointerEvents = "none";
      tmp.style.opacity = "0";
      document.body.appendChild(tmp);
      scratchRef.current = tmp;
    }

    const tmp = scratchRef.current;
    tmp.style.color = color;
    const rgb = getComputedStyle(tmp).color;
    return rgb || null;
  };

  const resolveBG = (start: Element): { img?: true; color?: string } => {
    let el: Element | null = start;
    while (el && el !== document.documentElement) {
      const cs = getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage !== "none") return { img: true };
      if (!isTransparent(cs.backgroundColor)) return { color: cs.backgroundColor };
      el = el.parentElement;
    }
    return {};
  };

  const sampleAt = (
    x: number,
    y: number,
    navNode: HTMLDivElement
  ): { type: "img" } | { type: "luma"; v: number } | null => {
    const stack = document.elementsFromPoint(x, y);
    for (const el of stack) {
      // Ignore the navbar node itself and anything inside it
      if (el === navNode || navNode.contains(el)) continue;

      // If a media element is directly on top, treat as media
      if (looksLikeMedia(el)) return { type: "img" };

      const bg = resolveBG(el);
      if (bg.img) return { type: "img" };
      if (bg.color) {
        const direct = parseRGBA(bg.color);
        if (direct) return { type: "luma", v: toLuma(direct.r, direct.g, direct.b) };

        const rgb = normalizeColorToRGB(bg.color);
        if (rgb) {
          const q = parseRGBA(rgb);
          if (q) return { type: "luma", v: toLuma(q.r, q.g, q.b) };
        }
      }
    }
    return null;
  };

  const decide = (avg: number, prevDark: boolean) => {
    if (lastLumaRef.current == null) {
      lastLumaRef.current = avg;
      return avg < threshold;
    }
    lastLumaRef.current = avg;

    if (!prevDark && avg < threshold - deadband) return true;
    if (prevDark && avg > threshold + deadband) return false;
    return prevDark;
  };

  const check = useCallback(() => {
    if (typeof window === "undefined") return;

    const node = elementRef.current;
    if (!node) return;

    const r = node.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    // sample just below the bar; 2 rows for rounded top
    const rowsY = [
      r.bottom + sampleUnderNavPx,
      r.bottom + sampleUnderNavPx + 18,
    ];
    const colsX = [0.15, 0.35, 0.5, 0.65, 0.85].map((p) => r.left + r.width * p);

    let anyDark = false;
    let mediaOnly = true;
    const lumas: number[] = [];

    for (const sy of rowsY) {
      for (const sx of colsX) {
        const res = sampleAt(sx, sy, node);
        if (!res) continue;

        if (res.type === "img") continue; // keep mediaOnly true until we find luma
        mediaOnly = false;
        lumas.push(res.v);
        if (res.v < threshold - 0.02) anyDark = true; // early dark vote
      }
    }

    const prev = isDarkRef.current;

    if (anyDark) {
      if (!prev) setIsDark(true);
      return;
    }

    if (!mediaOnly && lumas.length) {
      const avg = lumas.reduce((a, b) => a + b, 0) / lumas.length;
      const next = decide(avg, prev);
      if (next !== prev) setIsDark(next);
      return;
    }

    if (mediaOnly) {
      const next =
        mediaFallback === "always"
          ? true
          : mediaFallback === "never"
            ? false
            : prev; // previous
      if (next !== prev) setIsDark(next);
      return;
    }

    if (prev !== false) setIsDark(false);
  }, [threshold, deadband, mediaFallback, sampleUnderNavPx]);

  useEffect(() => {
    const tick = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        tickingRef.current = false;
        check();
      });
    };

    // initial delayed check (lets first paint settle)
    const t = window.setTimeout(check, 120);

    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    window.addEventListener("orientationchange", tick);
    document.addEventListener("visibilitychange", tick);

    if ("ResizeObserver" in window) {
      roRef.current = new ResizeObserver(() => tick());
      if (elementRef.current) roRef.current.observe(elementRef.current);
    }

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      window.removeEventListener("orientationchange", tick);
      document.removeEventListener("visibilitychange", tick);

      if (roRef.current) {
        roRef.current.disconnect();
        roRef.current = null;
      }

      // cleanup scratch element if it exists
      if (scratchRef.current) {
        scratchRef.current.remove();
        scratchRef.current = null;
      }
    };
  }, [check]);

  return { isDark, elementRef, refreshBackgroundCheck: check };
}
