"use client";

// Renders its children at the end of <body> instead of in place.
//
// For sheets and overlays opened from inside the page: in place, they belong
// to whatever stacking context the page content forms, and no z-index lets
// them rise above the fixed layers at the top level (the floating section
// dock, the promo bar), which then sat on top of the phone filter sheets. At
// the end of <body> they stack against those layers directly.

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

export default function BodyPortal({ children }: { children: ReactNode }) {
  // false on the server and during hydration, true once in the browser.
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  return inBrowser ? createPortal(children, document.body) : null;
}
