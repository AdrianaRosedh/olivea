// lib/introConstants.ts
// Shared constants for intro animations and layout
export const HERO = {
  vh: 29,
  overlapPx: 10,
  minGapPx: 25,
  baseVh: 26,
  baseGapPx: 20,
} as const;

export const TIMING = {
  introHoldMs: 30,
  morphSec: 0.6,
  settleMs: 100,
  // ⬇️ was 0.18 — make the overlay fade clearly visible/smooth
  crossfadeSec: 0.65,
} as const;

export const SPLASH = {
  holdMs: 240,
  afterCrossfadeMs: 120,
  fadeOutSec: 0.24,
  bobSec: 2.0,
} as const;

// Optional: a single place for your easing (nice & smooth)
export const EASE = {
  out: [0.19, 1, 0.22, 1] as [number, number, number, number], // easeOutCubic-ish
  inOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
};
