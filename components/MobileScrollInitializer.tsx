"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { EVENTS, emitEvent } from "@/lib/navigation-events"
import { SECTION_EVENTS } from "@/lib/section-navigation"

export default function MobileScrollInitializer() {
  const pathname = usePathname()
  const initCountRef = useRef(0)
  const hasInitializedRef = useRef(false)
  const isMobileRef = useRef(false)
  const lastActiveSection = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if on mobile device
    const checkMobile = () => {
      if (typeof navigator !== "undefined") {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
        isMobileRef.current = isMobileDevice
        return isMobileDevice
      }
      return false
    }

    // Only run on mobile
    if (!checkMobile()) return

    console.log("[MobileScrollInit] Mobile device detected, initializing")

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

      // Notify about the active section if it has changed
      if (activeSection && activeSection.id !== lastActiveSection.current) {
        lastActiveSection.current = activeSection.id
        console.log(`[MobileScrollInit] Active section detected: ${activeSection.id}`)

        // Dispatch both event types to ensure compatibility
        document.dispatchEvent(
          new CustomEvent(SECTION_EVENTS.SECTION_IN_VIEW, {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
              source: "mobile-initializer",
            },
          }),
        )

        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
              source: "mobile-initializer",
            },
          }),
        )
      }
    }

    const initializeMobileScroll = () => {
      const count = ++initCountRef.current
      console.log(`[MobileScrollInit] Initializing mobile scroll (attempt ${count}) for path: ${pathname}`)

      // Force scroll events
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      window.dispatchEvent(new Event("scroll"))

      // Check which section is currently visible
      checkVisibleSections()

      // Emit event to notify other components
      emitEvent(EVENTS.MOBILE_SCROLL_INITIALIZED, { count })

      hasInitializedRef.current = true
      console.log(`[MobileScrollInit] Initialization complete (attempt ${count})`)
    }

    // Run initialization on mount with multiple attempts
    initializeMobileScroll()
    const timers = [
      setTimeout(initializeMobileScroll, 100),
      setTimeout(initializeMobileScroll, 300),
      setTimeout(initializeMobileScroll, 600),
      setTimeout(initializeMobileScroll, 1000),
    ]

    // Function to handle scroll events with throttling
    let scrollTimeout: NodeJS.Timeout | null = null
    const handleScroll = () => {
      // Throttle scroll events
      if (scrollTimeout) return

      scrollTimeout = setTimeout(() => {
        scrollTimeout = null
        checkVisibleSections()
      }, 50) // 50ms throttle
    }

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Listen for navigation events
    const handleNavigationComplete = () => {
      console.log("[MobileScrollInit] Navigation complete, reinitializing")
      // Reset the counter on navigation
      initCountRef.current = 0
      hasInitializedRef.current = false
      lastActiveSection.current = null

      // Initialize with multiple attempts
      setTimeout(initializeMobileScroll, 100)
      setTimeout(initializeMobileScroll, 300)
      setTimeout(initializeMobileScroll, 600)
    }

    document.addEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)

    // Also initialize on document ready state change
    const checkReadyState = () => {
      if (document.readyState === "complete" && !hasInitializedRef.current) {
        initializeMobileScroll()
      }
    }

    document.addEventListener("readystatechange", checkReadyState)

    // Also initialize on load event
    window.addEventListener("load", initializeMobileScroll)

    // Also initialize on user interaction
    const handleUserInteraction = () => {
      if (initCountRef.current < 3) {
        initializeMobileScroll()
      }
    }

    document.addEventListener("touchstart", handleUserInteraction, { once: true })
    document.addEventListener("scroll", handleUserInteraction, { once: true })

    return () => {
      timers.forEach(clearTimeout)
      document.removeEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)
      document.removeEventListener("readystatechange", checkReadyState)
      window.removeEventListener("load", initializeMobileScroll)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("scroll", handleUserInteraction)
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [pathname])

  return null
}
