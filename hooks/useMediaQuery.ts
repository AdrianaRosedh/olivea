// hooks/useMediaQuery.ts
"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// useLayoutEffect has no meaning on the server and React warns if it is called
// there, so fall back to useEffect during SSR (where neither one runs).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Media query hook that is safe to use for conditional rendering.
 *
 * This used to seed state from window.matchMedia inside the useState
 * initializer, to get "the correct value on the first render". But on the
 * client the first render IS the hydration render: React diffs it against the
 * server HTML, and the server has no viewport, so the two disagreed on every
 * screen the query matched.
 *
 * That mattered because LayoutShell branches its whole tree on useIsMobile() —
 * the footer and docks render only when !isMobileLike. The server (always
 * "not mobile") emitted those subtrees and the client's first render did not,
 * so React threw the server markup away and re-rendered the page on the
 * client: "Hydration failed because the server rendered HTML didn't match".
 *
 * Starting at false matches the server. Reading the real value in a layout
 * effect updates it after hydration commits but *before* the browser paints,
 * so there is still no visible flash of the desktop layout — which is what the
 * initializer was reaching for in the first place.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useIsomorphicLayoutEffect(() => {
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
