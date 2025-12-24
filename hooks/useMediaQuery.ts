// hooks/useMediaQuery.ts
"use client";

import { useEffect, useState } from "react";

/**
 * Stable media query hook:
 * - correct value on first render
 * - no desktop flicker
 * - safe on SSR (returns false there)
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    const media = window.matchMedia(query);

    const onChange = () => setMatches(media.matches);
    onChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    } else {
      // Safari fallback
      media.addListener(onChange);
      return () => media.removeListener(onChange);
    }
  }, [query]);

  return matches;
}

// Predefined media queries (Tailwind-aligned)
export const useIsMobile = () => useMediaQuery("(max-width: 767.98px)");
export const useIsTablet = () =>
  useMediaQuery("(min-width: 768px) and (max-width: 1023.98px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
