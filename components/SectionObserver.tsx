"use client"

import { useEffect, useRef, useState } from "react"
import { EVENTS, emitEvent } from "@/lib/navigation-events"

interface SectionObserverProps {
  sectionIds: string[]
}

export default function SectionObserver({ sectionIds }: SectionObserverProps) {
  const observersRef = useRef<IntersectionObserver[]>([])
  const activeIdRef = useRef<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const initialLoadRef = useRef(true)
  const isScrollingProgrammaticallyRef = useRef(false)
  const debugModeRef = useRef(false) // Enable debug logs
  const observationPausedRef = useRef(false)

  // Debug logger
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[SectionObserver]", ...args)
    }
  }

  // Function to create and start observers
  const initializeObservers = () => {
    debugLog("Initializing observers for sections:", sectionIds)

    // Clean up any existing observers
    observersRef.current.forEach((observer) => observer.disconnect())
    observersRef.current = []

    // Set initial active section (first section)
    if (sectionIds.length > 0 && !activeIdRef.current) {
      activeIdRef.current = sectionIds[0]

      // Don't dispatch event during initial load
      if (!initialLoadRef.current) {
        debugLog(`Setting initial active section: ${sectionIds[0]}`)
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: sectionIds[0],
              intersectionRatio: 1.0,
            },
          }),
        )
      }
    }

    // Create observers for each section with different thresholds
    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (!section) {
        console.warn(`Section with id "${id}" not found`)
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          // Skip if observation is paused
          if (observationPausedRef.current) return

          // Skip if we're scrolling programmatically
          if (isScrollingProgrammaticallyRef.current) return

          entries.forEach((entry) => {
            // Use a higher threshold for determining active section
            if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
              // Only update if this is a new active section
              if (activeIdRef.current !== id) {
                debugLog(`Section in view: ${id} (ratio: ${entry.intersectionRatio.toFixed(2)})`)
                activeIdRef.current = id

                // Dispatch custom event when section is in view
                document.dispatchEvent(
                  new CustomEvent("sectionInView", {
                    detail: {
                      id,
                      intersectionRatio: entry.intersectionRatio,
                      fromScroll: true,
                    },
                  }),
                )

                // Also emit section change event
                emitEvent(EVENTS.SECTION_CHANGE, {
                  id,
                  source: "observer",
                  intersectionRatio: entry.intersectionRatio,
                })
              }
            }
          })
        },
        {
          root: null,
          rootMargin: "-15% 0px -35% 0px",
          threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        },
      )

      observer.observe(section)
      observersRef.current.push(observer)
    })

    setInitialized(true)
    debugLog("Observers initialized")
  }

  useEffect(() => {
    // Prevent hydration issues by only running on client
    if (typeof window === "undefined") return

    debugLog("Component mounted")

    // Initialize observers with a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeObservers()
    }, 100)

    // Listen for reinitialize event
    const handleReinitialize = () => {
      debugLog("Reinitializing observers")
      initializeObservers()
    }

    // After 3 seconds, consider initial load complete
    const initialLoadTimer = setTimeout(() => {
      initialLoadRef.current = false
      debugLog("Initial load period complete")
    }, 3000)

    // Listen for scroll events from DockLeft
    const handleScrollStart = () => {
      isScrollingProgrammaticallyRef.current = true
      observationPausedRef.current = true
    }

    const handleScrollComplete = () => {
      // Wait a bit before re-enabling observers to avoid jumps
      setTimeout(() => {
        isScrollingProgrammaticallyRef.current = false
        observationPausedRef.current = false

        // Force a scroll event to reactivate observers
        window.dispatchEvent(new Event("scroll"))
      }, 150)
    }

    // Listen for section snap events
    const handleSectionSnapStart = () => {
      observationPausedRef.current = true
    }

    const handleSectionSnapComplete = () => {
      setTimeout(() => {
        observationPausedRef.current = false
      }, 150)
    }

    document.addEventListener("observers:reinitialize", handleReinitialize)
    document.addEventListener(EVENTS.SCROLL_START, handleScrollStart)
    document.addEventListener(EVENTS.SCROLL_COMPLETE, handleScrollComplete)
    document.addEventListener(EVENTS.SECTION_SNAP_START, handleSectionSnapStart)
    document.addEventListener(EVENTS.SECTION_SNAP_COMPLETE, handleSectionSnapComplete)

    // Force a scroll event after initialization
    const scrollTimer = setTimeout(() => {
      window.dispatchEvent(new Event("scroll"))
    }, 200)

    return () => {
      clearTimeout(timer)
      clearTimeout(scrollTimer)
      clearTimeout(initialLoadTimer)
      observersRef.current.forEach((observer) => observer.disconnect())
      document.removeEventListener("observers:reinitialize", handleReinitialize)
      document.removeEventListener(EVENTS.SCROLL_START, handleScrollStart)
      document.removeEventListener(EVENTS.SCROLL_COMPLETE, handleScrollComplete)
      document.removeEventListener(EVENTS.SECTION_SNAP_START, handleSectionSnapStart)
      document.removeEventListener(EVENTS.SECTION_SNAP_COMPLETE, handleSectionSnapComplete)
    }
  }, [sectionIds])

  // Force reinitialization on scroll if not initialized
  useEffect(() => {
    if (!initialized) {
      const handleScroll = () => {
        if (!initialized) {
          initializeObservers()
        }
      }

      window.addEventListener("scroll", handleScroll, { once: true, passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [initialized])

  return null // This component doesn't render anything
}
