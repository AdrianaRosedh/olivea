"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { EVENTS, emitEvent } from "@/lib/navigation-events"

export function useNavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathRef = useRef<string | null>(null)

  // This effect runs on both initial load and route changes
  useEffect(() => {
    const currentPath = `${pathname}${searchParams ? `?${searchParams}` : ""}`

    // Check if this is a navigation or initial load
    if (previousPathRef.current !== null && previousPathRef.current !== currentPath) {
      console.log(`[Navigation] Route changed: ${currentPath}`)
      emitEvent(EVENTS.NAVIGATION_START)

      // After a short delay, emit navigation complete
      setTimeout(() => {
        emitEvent(EVENTS.NAVIGATION_COMPLETE)

        // Trigger scroll initialization after navigation
        setTimeout(() => {
          emitEvent(EVENTS.SCROLL_INITIALIZE)
        }, 100)
      }, 100)
    }

    // Update previous path
    previousPathRef.current = currentPath
  }, [pathname, searchParams])
}
