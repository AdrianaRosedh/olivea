// lib/introConstants.ts
// Shared constants for intro animations and layout
export const HERO = {
  vh: 29,
  overlapPx: 10,
  minGapPx: 25,
  baseVh: 26,
  baseGapPx: 20,
} as const;

/** The phone cards' entrance once the intro clears (HomeClient, InlineEntranceCard). */
export const CASCADE = {
  /** Before the first card starts to rise. */
  delaySec: 0.15,
  /** Between one card and the next. */
  staggerSec: 0.12,
  /** How long after its card an emblem starts to settle. */
  emblemLagSec: 0.18,
} as const;

export const TIMING = {
  // The green box and the alebrije shrink together over this time.
  morphSec: 0.75,
  settleMs: 100,
  // ⬇️ was 0.18 — make the overlay fade clearly visible/smooth
  crossfadeSec: 0.65,
} as const;

export const SPLASH = {
  /** The alebrije's line drawing. The loader bars run for the same time. */
  drawSec: 2.0,
  /** Extra time allowed for the drawing (download, slow phone) before moving on. */
  drawGraceMs: 1500,
  /** Rendered size of the splash alebrije. */
  sizePx: 240,
  /** On a phone the alebrije settles in the middle of the hero, this share of its size. */
  heroFit: 0.6,
  /** The loader bars fade out before the screen shrinks. */
  barFadeSec: 0.2,
  /** Pause on the finished drawing before the screen shrinks. */
  holdMs: 240,
  fadeOutSec: 0.24,
  bobSec: 2.0,
} as const;

export const INTRO = {
  // Hard cap after the drawing's own allowance. The rest of the sequence
  // (hold, morph, move, fade) takes about 2.2 s; if anything stalls, the
  // overlay is cleared anyway so it can never sit over the page.
  afterDrawWatchdogMs: 4000,
} as const;

// Optional: a single place for your easing (nice & smooth)
export const EASE = {
  out: [0.19, 1, 0.22, 1] as [number, number, number, number], // easeOutCubic-ish
  inOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
};
