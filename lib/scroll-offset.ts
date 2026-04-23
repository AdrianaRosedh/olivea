// lib/scroll-offset.ts
// Single source of truth for scroll-to-section offset.
// Reads --scroll-offset from CSS (set in globals.css).

/**
 * Returns the pixel value of --scroll-offset from the root element.
 * Falls back to 120 if the variable isn't available (SSR, etc.).
 */
export function scrollOffsetPx(): number {
  if (typeof window === "undefined") return 120;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset");
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 120;
}
