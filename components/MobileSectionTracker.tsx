"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface MobileSectionTrackerProps {
  sectionIds: string[]
}

/**
 * Component that specifically handles mobile section tracking
 * This ensures the mobile navigation properly highlights active sections
 */
export default function MobileSectionTracker({ sectionIds }: MobileSectionTrackerProps) {
  const pathname = usePathname()
  const observersRef = useRef<IntersectionObserver[]>([])
  const hasInitializedRef = useRef(false)

  // Function to initialize observers
  const initializeObservers = () => {
    console.log("[MobileSectionTracker] Initializing observers for sections:", sectionIds)

    // Clean up any existing observers
    if (observersRef.current.length > 0) {
      observersRef.current.forEach((observer) => observer.disconnect())
      observersRef.current = []
    }

    // Create observers for each section with different priorities
    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (!section) {
        console.warn(`[MobileSectionTracker] Section with id "${id}" not found`)
        return
      }

      // Update the observer settings for better mobile detection
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
              // When section is visible, dispatch a custom event with lower threshold
              const event = new CustomEvent("sectionInView", {
                detail: { id, intersectionRatio: entry.intersectionRatio },
              })
              document.dispatchEvent(event)
            }
          })
        },
        {
          root: null,
          // Adjusted rootMargin for better mobile detection
          rootMargin: "-10% 0px -20% 0px",
          // More granular thresholds for better detection
          threshold: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5],
        },
      )

      // Start observing
      observer.observe(section)

      // Store observer for cleanup
      observersRef.current.push(observer)
    })

    hasInitializedRef.current = true
    console.log("[MobileSectionTracker] Observers initialized")
  }

  useEffect(() => {
    // Initialize observers with a slight delay
    const timer = setTimeout(() => {
      initializeObservers()
    }, 200)

    // Force a scroll event to initialize section detection
    const scrollTimer = setTimeout(() => {
      window.dispatchEvent(new Event("scroll"))
    }, 300)

    return () => {
      // Clean up all observers
      observersRef.current.forEach((observer) => observer.disconnect())
      clearTimeout(timer)
      clearTimeout(scrollTimer)
    }
  }, [sectionIds, pathname]) // Re-initialize on path change

  // This component doesn't render anything
  return null
}
