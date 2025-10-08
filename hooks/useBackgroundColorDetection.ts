"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type MediaFallback = "previous" | "always" | "never";
type Options = {
  threshold?: number;            // default 0.48
  deadband?: number;             // default 0.03
  mediaFallback?: MediaFallback; // default "previous"
  sampleUnderNavPx?: number;     // default 8
};

export function useBackgroundColorDetection(opts: Options = {}) {
  const {
    threshold = 0.48,
    deadband = 0.03,
    mediaFallback = "previous",
    sampleUnderNavPx = 8,
  } = opts;

  const [isDark, setIsDark] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const lastLumaRef = useRef<number | null>(null);
  const tickingRef = useRef(false);
  const roRef = useRef<ResizeObserver | null>(null);

  const toLuma = (r: number, g: number, b: number) => {
    const lin = (v: number) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const parseRGBA = (s: string) => {
    const m = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([.\d]+))?\s*\)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? +m[4] : 1 };
  };
  const isTransparent = (bg: string) =>
    !bg || bg === "transparent" || /rgba\(/i.test(bg) && (parseRGBA(bg)?.a ?? 1) <= 0.01;

  const looksLikeMedia = (el: Element) =>
    el.matches("img, picture, video, canvas, svg") ||
    !!el.querySelector("img, picture, video, canvas, svg");

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

  const sampleAt = (x: number, y: number): { type: "img" } | { type: "luma"; v: number } | null => {
    const stack = document.elementsFromPoint(x, y);
    for (const el of stack) {
      if (el === elementRef.current) continue;
      if (looksLikeMedia(el)) return { type: "img" };
      const bg = resolveBG(el);
      if (bg.img) return { type: "img" };
      if (bg.color) {
        const p = parseRGBA(bg.color);
        if (p) return { type: "luma", v: toLuma(p.r, p.g, p.b) };
        // Normalize keyword/hex
        const tmp = document.createElement("div");
        tmp.style.color = bg.color;
        document.body.appendChild(tmp);
        const rgb = getComputedStyle(tmp).color;
        document.body.removeChild(tmp);
        const q = parseRGBA(rgb);
        if (q) return { type: "luma", v: toLuma(q.r, q.g, q.b) };
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
    const node = elementRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    // sample just below the bar, across card width; 2 rows for rounded top
    const rowsY = [r.bottom + sampleUnderNavPx, r.bottom + sampleUnderNavPx + 18];
    const colsX = [0.15, 0.35, 0.5, 0.65, 0.85].map(p => r.left + r.width * p);

    let anyDark = false;
    let mediaOnly = true;
    const lumas: number[] = [];

    for (const sy of rowsY) {
      for (const sx of colsX) {
        const res = sampleAt(sx, sy);
        if (!res) continue;
        if (res.type === "img") continue; // keep mediaOnly true until we find luma
        mediaOnly = false;
        lumas.push(res.v);
        if (res.v < threshold - 0.02) anyDark = true; // early dark vote
      }
    }

    if (anyDark) { if (!isDark) setIsDark(true); return; }

    if (!mediaOnly && lumas.length) {
      const avg = lumas.reduce((a, b) => a + b, 0) / lumas.length;
      const next = decide(avg, isDark);
      if (next !== isDark) setIsDark(next);
      return;
    }

    if (mediaOnly) {
      const next =
        mediaFallback === "always" ? true :
        mediaFallback === "never"  ? false :
        isDark;
      if (next !== isDark) setIsDark(next);
      return;
    }

    if (isDark !== false) setIsDark(false);
  }, [threshold, deadband, mediaFallback, sampleUnderNavPx, isDark]);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => { tickingRef.current = false; check(); });
    };
    const t = window.setTimeout(check, 120);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    document.addEventListener("visibilitychange", check);

    if ("ResizeObserver" in window) {
      roRef.current = new ResizeObserver(() => check());
      if (elementRef.current) roRef.current.observe(elementRef.current);
    }

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      document.removeEventListener("visibilitychange", check);
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
    };
  }, [check]);

  return { isDark, elementRef, refreshBackgroundCheck: check };
}