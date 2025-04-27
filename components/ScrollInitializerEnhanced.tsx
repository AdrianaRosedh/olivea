"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Enhanced component that ensures scroll animations and behaviors are properly initialized
 * on both initial load and during navigation in Next.js 15 and React 19
 */
export default function ScrollInitializerEnhanced() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitializedRef = useRef(false)
  const navigationCountRef = useRef(0)

  // This effect runs on both initial load and route changes
  useEffect(() => {
    // Increment navigation counter
    navigationCountRef.current += 1

    // Track if this is initial load or navigation
    const isNavigation = navigationCountRef.current > 1

    console.log(`[ScrollInitializer] Route changed: ${pathname}${isNavigation ? " (navigation)" : " (initial)"}`)

    // Function to initialize scroll behaviors
    const initializeScroll = (delay = 0) => {
      setTimeout(() => {
        console.log(`[ScrollInitializer] Initializing scroll (delay: ${delay}ms)...`)

        // 1. Find all scroll containers
        const scrollContainers = document.querySelectorAll(".scroll-container")

        // 2. Force a minimal scroll to activate scroll listeners
        window.scrollBy(0, 1)
        window.scrollBy(0, -1)

        // 3. Dispatch events that scroll listeners might be waiting for
        window.dispatchEvent(new Event("scroll"))
        window.dispatchEvent(new Event("resize"))

        // 4. Initialize all scroll containers
        scrollContainers.forEach((container) => {
          // Force a minimal scroll on containers
          const currentScroll = container.scrollTop
          container.scrollTop = currentScroll + 1
          container.scrollTop = currentScroll

          // Trigger scroll events on containers
          const scrollEvent = new Event("scroll", { bubbles: true })
          container.dispatchEvent(scrollEvent)
        })

        // 5. Re-apply any hash scrolling
        if (window.location.hash) {
          const id = window.location.hash.substring(1)
          const element = document.getElementById(id)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }

        // 6. Find and initialize all section observers
        document.dispatchEvent(new CustomEvent("reinitialize-observers"))

        console.log("[ScrollInitializer] Initialization complete")
      }, delay)
    }

    // For navigation (not initial load), use a slightly longer delay
    // to ensure the DOM is fully updated
    if (isNavigation) {
      initializeScroll(100) // Short delay for immediate attempt
      initializeScroll(300) // Medium delay
      initializeScroll(600) // Longer delay as fallback
    } else {
      // For initial load
      initializeScroll(0) // Immediate attempt
      initializeScroll(200) // Short delay
      initializeScroll(500) // Medium delay as fallback
    }

    // Mark as initialized
    isInitializedRef.current = true

    // Also initialize on first user interaction
    const handleFirstInteraction = () => {
      initializeScroll(0)
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
  }, [pathname, searchParams]) // Re-run when route changes

  // This component doesn't render anything
  return null
}
