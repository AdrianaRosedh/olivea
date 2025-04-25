"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for responsive design
 * @param query CSS media query string
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false to avoid hydration mismatch
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Set initial value after mount to avoid hydration mismatch
    const media = window.matchMedia(query)
    setMatches(media.matches)

    // Update matches when media query changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

// Predefined media queries
export const useIsMobile = () => useMediaQuery("(max-width: 767px)")
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)")
