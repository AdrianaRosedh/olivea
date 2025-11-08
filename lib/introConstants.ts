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
  crossfadeSec: 0.18,
} as const;

export const SPLASH = {
  holdMs: 240,
  afterCrossfadeMs: 120,
  fadeOutSec: 0.24,
  bobSec: 2.0,
} as const;
