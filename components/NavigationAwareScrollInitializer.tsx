"use client"

import { useEffect, useRef } from "react"
import { EVENTS } from "@/lib/navigation-events"
import { usePathname } from "next/navigation"

export default function NavigationAwareScrollInitializer() {
  const pathname = usePathname()
  const initCountRef = useRef(0)

  // Initialize scroll behaviors when requested
  useEffect(() => {
    if (typeof window === "undefined") return

    const initializeScroll = () => {
      const count = ++initCountRef.current
      console.log(`[ScrollInit] Initializing scroll (attempt ${count}) for path: ${pathname}`)

      // Force scroll events
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)

      // Dispatch scroll and resize events
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("resize"))

      // Find all scroll containers and force scroll events on them
      const scrollContainers = document.querySelectorAll(".scroll-container")
      scrollContainers.forEach((container) => {
        const currentScroll = container.scrollTop
        container.scrollTop = currentScroll + 1
        container.scrollTop = currentScroll
        container.dispatchEvent(new Event("scroll", { bubbles: true }))
      })

      // Find all sections and force intersection observer updates
      const sections = document.querySelectorAll("section[id]")
      sections.forEach((section) => {
        // Force a layout recalculation
        section.getBoundingClientRect()
      })

      // Dispatch a custom event for observers to reinitialize
      document.dispatchEvent(new CustomEvent("observers:reinitialize"))

      console.log(`[ScrollInit] Initialization complete (attempt ${count})`)
    }

    // Run initialization on mount with multiple attempts
    initializeScroll()
    const timers = [
      setTimeout(initializeScroll, 100),
      setTimeout(initializeScroll, 300),
      setTimeout(initializeScroll, 600),
      setTimeout(initializeScroll, 1000),
    ]

    // Listen for scroll initialization events
    const handleScrollInit = () => {
      console.log("[ScrollInit] Received scroll:initialize event")
      initializeScroll()

      // Multiple attempts after navigation
      setTimeout(initializeScroll, 100)
      setTimeout(initializeScroll, 300)
      setTimeout(initializeScroll, 600)
    }

    document.addEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)

    // Also listen for navigation complete events
    const handleNavigationComplete = () => {
      console.log("[ScrollInit] Received navigation:complete event")
      // Reset the counter on navigation
      initCountRef.current = 0

      // Initialize with multiple attempts
      setTimeout(initializeScroll, 100)
      setTimeout(initializeScroll, 300)
      setTimeout(initializeScroll, 600)
    }

    document.addEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)

    // Also initialize on user interaction
    const handleUserInteraction = () => {
      if (initCountRef.current < 3) {
        initializeScroll()
      }
    }

    document.addEventListener("click", handleUserInteraction, { once: true })
    document.addEventListener("scroll", handleUserInteraction, { once: true })

    return () => {
      timers.forEach(clearTimeout)
      document.removeEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)
      document.removeEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("scroll", handleUserInteraction)
    }
  }, [pathname])

  return null
}
