// hooks/usePrefersReducedMotion.ts
// ─────────────────────────────────────────────────────────────────────
// prefers-reduced-motion, safe to render with.
//
// framer-motion's useReducedMotion() answers from the browser on the very
// first render — the hydration render — while the server always answered
// "no". For a guest with reduced motion on, components that render different
// styles or elements from it (the home cards, the entrance card's video)
// disagreed with the server HTML, and React threw the tree away and rebuilt it
// (React error #418 on the live site).
//
// This reports `false` while hydrating, exactly like the server, then the real
// preference straight after, and follows changes to the setting.
// ─────────────────────────────────────────────────────────────────────
"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
