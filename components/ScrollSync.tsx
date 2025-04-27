"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// This component directly synchronizes scroll position with UI components
export default function ScrollSync() {
  const pathname = usePathname()
  const isInitializedRef = useRef(false)
  const activeTimersRef = useRef<NodeJS.Timeout[]>([])
  const lastScrollPercentageRef = useRef<number | null>(null)

  // Function to force UI updates based on current scroll position
  const forceScrollSync = () => {
    console.log("[ScrollSync] Forcing UI sync with scroll position")

    // 1. Get current scroll position
    const scrollPosition = window.scrollY
    const documentHeight =
      Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
      ) - window.innerHeight

    // 2. Calculate scroll percentage
    const scrollPercentage = documentHeight > 0 ? Math.round((scrollPosition / documentHeight) * 100) : 0

    // Only update if the percentage has changed
    if (lastScrollPercentageRef.current !== scrollPercentage) {
      lastScrollPercentageRef.current = scrollPercentage

      // 3. Find the current section based on scroll position
      const sections = Array.from(document.querySelectorAll("section[id]"))
      let activeSection: Element | null = null

      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        // Consider a section active if it's in the middle third of the viewport
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          activeSection = section
          break
        }
      }

      // 4. Dispatch events to update UI components
      console.log(
        `[ScrollSync] Scroll: ${scrollPercentage}%${activeSection ? `, Active section: ${activeSection.id}` : ""}`,
      )

      // Dispatch custom event for scroll percentage
      document.dispatchEvent(
        new CustomEvent("scrollPercentage", {
          detail: {
            percentage: scrollPercentage,
          },
        }),
      )

      // Dispatch custom event for color gradient
      document.dispatchEvent(
        new CustomEvent("updateGradient", {
          detail: {
            scrollPercentage,
          },
        }),
      )

      // Dispatch custom event for section visibility if we have an active section
      if (activeSection) {
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: activeSection.id,
              scrollPercentage,
            },
          }),
        )
      }
    }
  }

  // Initialize and handle navigation
  useEffect(() => {
    if (typeof window === "undefined") return

    console.log(`[ScrollSync] Initializing for path: ${pathname}`)

    // Clear any existing timers
    activeTimersRef.current.forEach(clearTimeout)
    activeTimersRef.current = []

    // Reset last scroll percentage
    lastScrollPercentageRef.current = null

    // Function to initialize with multiple attempts
    const initialize = () => {
      // Schedule multiple attempts with increasing delays
      const timers = [
        setTimeout(forceScrollSync, 0), // Immediate
        setTimeout(forceScrollSync, 100), // Short delay
        setTimeout(forceScrollSync, 300), // Medium delay
        setTimeout(forceScrollSync, 600), // Longer delay
        setTimeout(forceScrollSync, 1000), // Final attempt
      ]

      activeTimersRef.current = timers
    }

    // Initialize immediately
    initialize()

    // Add scroll event listener
    const handleScroll = () => {
      requestAnimationFrame(forceScrollSync)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Also initialize on user interaction
    const handleUserInteraction = () => {
      forceScrollSync()
    }

    document.addEventListener("click", handleUserInteraction, { passive: true })

    // Mark as initialized
    isInitializedRef.current = true

    return () => {
      activeTimersRef.current.forEach(clearTimeout)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("click", handleUserInteraction)
    }
  }, [pathname]) // Re-initialize on path change

  return null // This component doesn't render anything
}
