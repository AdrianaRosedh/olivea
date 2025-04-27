"use client"

import { useEffect, useRef } from "react"

/**
 * Component that ensures scroll animations and behaviors are properly initialized
 * Specifically designed for Next.js 15 and React 19
 */
export default function ScrollInitializer() {
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // Skip if already initialized to prevent duplicate initialization
    if (isInitializedRef.current) return

    // Mark as initialized
    isInitializedRef.current = true

    // Function to initialize scroll behaviors
    const initializeScroll = () => {
      console.log("Initializing scroll behaviors...")

      // 1. Force a minimal scroll to activate scroll listeners
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)

      // 2. Dispatch events that scroll listeners might be waiting for
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("resize"))

      // 3. Re-apply any hash scrolling with a slight delay
      if (window.location.hash) {
        const id = window.location.hash.substring(1)
        const element = document.getElementById(id)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 100)
        }
      }

      // 4. Find and initialize all scroll containers
      const scrollContainers = document.querySelectorAll(".scroll-container")
      scrollContainers.forEach((container) => {
        // Trigger scroll events on containers
        const scrollEvent = new Event("scroll", { bubbles: true })
        container.dispatchEvent(scrollEvent)
      })

      console.log("Scroll initialization complete")
    }

    // Try multiple initialization attempts with increasing delays
    // This helps ensure initialization happens after all components are fully hydrated
    setTimeout(initializeScroll, 0) // Immediate attempt
    setTimeout(initializeScroll, 100) // Short delay
    setTimeout(initializeScroll, 500) // Medium delay
    setTimeout(initializeScroll, 1000) // Longer delay as fallback

    // Also initialize on first user interaction
    const handleFirstInteraction = () => {
      initializeScroll()
      // Remove listeners after first interaction
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("scroll", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("scroll", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    // Clean up
    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("scroll", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [])

  // This component doesn't render anything
  return null
}
