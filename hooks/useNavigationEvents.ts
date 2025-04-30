"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { EVENTS, emitEvent } from "@/lib/navigation-events"

export function useNavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathRef = useRef<string | null>(null)
  const navigationInProgressRef = useRef(false)

  // This effect runs on both initial load and route changes
  useEffect(() => {
    if (typeof window === "undefined") return

    const currentPath = `${pathname}${searchParams ? `?${searchParams}` : ""}`

    // Check if this is a navigation or initial load
    if (previousPathRef.current !== null && previousPathRef.current !== currentPath) {
      console.log(`[Navigation] Route changed: ${previousPathRef.current} -> ${currentPath}`)

      // Prevent duplicate events
      if (!navigationInProgressRef.current) {
        navigationInProgressRef.current = true
        emitEvent(EVENTS.NAVIGATION_START)

        // After a short delay, emit navigation complete
        setTimeout(() => {
          emitEvent(EVENTS.NAVIGATION_COMPLETE)
          navigationInProgressRef.current = false

          // Trigger scroll initialization after navigation
          setTimeout(() => {
            emitEvent(EVENTS.SCROLL_INITIALIZE)
          }, 100)
        }, 100)
      }
    }

    // Update previous path
    previousPathRef.current = currentPath

    return () => {
      // If component unmounts during navigation, reset the flag
      navigationInProgressRef.current = false
    }
  }, [pathname, searchParams])

  // Also set up a MutationObserver to detect DOM changes that might indicate navigation
  useEffect(() => {
    if (typeof window === "undefined") return

    // Create a MutationObserver to detect DOM changes that might indicate navigation
    const observer = new MutationObserver((mutations) => {
      // If we detect significant DOM changes and navigation isn't already in progress
      if (!navigationInProgressRef.current && mutations.length > 10) {
        navigationInProgressRef.current = true
        console.log(`[Navigation] Detected significant DOM changes (${mutations.length} mutations)`)
        emitEvent(EVENTS.NAVIGATION_START)

        // After a short delay, emit navigation complete
        setTimeout(() => {
          emitEvent(EVENTS.NAVIGATION_COMPLETE)
          navigationInProgressRef.current = false

          // Trigger scroll initialization after navigation
          setTimeout(() => {
            emitEvent(EVENTS.SCROLL_INITIALIZE)
          }, 100)
        }, 100)
      }
    })

    // Start observing the entire document for changes
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    })

    return () => {
      observer.disconnect()
    }
  }, [])
}
