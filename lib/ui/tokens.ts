// lib/ui/tokens.ts
/**
 * Semantic, documented UI tokens for consistent layout.
 * Use these instead of "magic numbers" in components.
 */

export const DOCK = {
  leftPx: 240,     // Left vertical dock width in desktop layout
  rightPx: 96,     // Right vertical dock width in desktop layout
  gapPx: 24,       // Space between content and docks
} as const;

export const NAVBAR = {
  heightPx: 64,        // Top nav height desktop
  heightMobilePx: 56,  // Top nav height mobile
} as const;

export const CARD = {
  radiusPx: 24,
  shadow: "shadow-xl",
} as const;

export const BREAKPOINT = {
  md: 768,
  lg: 1024,
} as const;

/** Convenience computed values */
export const DOCK_COMPUTED = {
  guttersPx: DOCK.leftPx + DOCK.rightPx + DOCK.gapPx * 2,
} as const;
