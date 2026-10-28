// components/layout/logoGeometry.ts
// Where the desktop logo sits and how big it is, in one place: the navbar
// draws the logo with these, and the left docks (Press, Journal, Team) start
// just under it. The logo grows with the screen (10.5vw, up to 230px), so a
// dock placed at a fixed height ran into it on wide screens.

/** Space above the navbar row (and the logo). */
export const NAV_TOP_GAP = 18; // px
export const NAV_TOP_OFFSET = `calc(env(safe-area-inset-top) + ${NAV_TOP_GAP}px)`;

/** The logo's square box and the small margin above it. */
export const LOGO_W = "clamp(96px, 10.5vw, 230px)";
export const LOGO_MARGIN_TOP = "clamp(2px, 0.9vh, 10px)";

/** The logo's bottom edge. */
export const LOGO_BOTTOM = `calc(${NAV_TOP_OFFSET} + ${LOGO_MARGIN_TOP} + ${LOGO_W})`;

/** Where a left dock starts: a clear gap under the logo. */
export const UNDER_LOGO = `calc(${LOGO_BOTTOM} + 20px)`;
