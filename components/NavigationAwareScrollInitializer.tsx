"use client"

import { useEffect, useRef } from "react"
import { EVENTS } from "@/lib/navigation-events"
import { usePathname } from "next/navigation"
import { notifySectionChange } from "@/lib/section-navigation"

export default function NavigationAwareScrollInitializer() {
  const pathname = usePathname()
  const initCountRef = useRef(0)
  const debugModeRef = useRef(true)

  // Debug logger
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[ScrollInit]", ...args)
    }
  }

  // Function to check which section is currently in view
  const checkVisibleSections = () => {
    // Find all sections
    const sections = document.querySelectorAll("section[id]")
    if (sections.length === 0) return

    // Find which section is currently in view
    let activeSection: Element | null = null
    let maxVisibility = 0

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate how much of the section is visible
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
      const visibility = visibleHeight / rect.height

      if (visibility > maxVisibility) {
        maxVisibility = visibility
        activeSection = section
      }
    })

    // Notify about the active section
    if (activeSection) {
      debugLog(`Active section detected: ${activeSection.id}`)
      notifySectionChange(activeSection.id, "initializer")
    }
  }

  // Initialize scroll behaviors when requested
  useEffect(() => {
    if (typeof window === "undefined") return

    const initializeScroll = () => {
      const count = ++initCountRef.current
      debugLog(`Initializing scroll (attempt ${count}) for path: ${pathname}`)

      // Force scroll events
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      window.dispatchEvent(new Event("scroll"))

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

      // Check which section is currently visible
      checkVisibleSections()

      // Dispatch a custom event for observers to reinitialize
      document.dispatchEvent(new CustomEvent("observers:reinitialize"))

      debugLog(`Initialization complete (attempt ${count})`)
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
      debugLog("Received scroll:initialize event")
      initializeScroll()

      // Multiple attempts after navigation
      setTimeout(initializeScroll, 100)
      setTimeout(initializeScroll, 300)
      setTimeout(initializeScroll, 600)
    }

    document.addEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)

    // Also listen for navigation complete events
    const handleNavigationComplete = () => {
      debugLog("Received navigation:complete event")
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

    // Listen for scroll events on the scroll container
    const scrollContainers = document.querySelectorAll(".scroll-container")
    scrollContainers.forEach((container) => {
      container.addEventListener("scroll", () => {
        // Throttle the check to avoid performance issues
        if (!container.dataset.scrollThrottle) {
          container.dataset.scrollThrottle = "true"
          setTimeout(() => {
            checkVisibleSections()
            delete container.dataset.scrollThrottle
          }, 100)
        }
      })
    })

    document.addEventListener("click", handleUserInteraction, { once: true })
    document.addEventListener("scroll", handleUserInteraction, { once: true })

    return () => {
      timers.forEach(clearTimeout)
      document.removeEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)
      document.removeEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("scroll", handleUserInteraction)

      // Clean up scroll container listeners
      scrollContainers.forEach((container) => {
        container.removeEventListener("scroll", () => {})
      })
    }
  }, [pathname])

  return null
}
