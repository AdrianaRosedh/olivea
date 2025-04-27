"use client"

import { useEffect, useRef } from "react"

interface SectionObserverProps {
  sectionIds: string[]
}

export default function SectionObserver({ sectionIds }: SectionObserverProps) {
  const observersRef = useRef<IntersectionObserver[]>([])
  const activeIdRef = useRef<string | null>(null)

  // Function to create and start observers
  const initializeObservers = () => {
    console.log("[SectionObserver] Initializing observers for sections:", sectionIds)

    // Clean up any existing observers
    observersRef.current.forEach((observer) => observer.disconnect())
    observersRef.current = []

    // Set initial active section (first section)
    if (sectionIds.length > 0 && !activeIdRef.current) {
      activeIdRef.current = sectionIds[0]
      document.dispatchEvent(
        new CustomEvent("sectionInView", {
          detail: {
            id: sectionIds[0],
            intersectionRatio: 1.0,
          },
        }),
      )
    }

    // Create observers for each section
    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (!section) {
        console.warn(`[SectionObserver] Section with id "${id}" not found`)
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              // Only update if this is a new active section
              if (activeIdRef.current !== id) {
                activeIdRef.current = id

                // Dispatch custom event when section is in view
                document.dispatchEvent(
                  new CustomEvent("sectionInView", {
                    detail: {
                      id,
                      intersectionRatio: entry.intersectionRatio,
                    },
                  }),
                )
              }
            }
          })
        },
        {
          root: null,
          rootMargin: "-20% 0px -30% 0px",
          threshold: [0.1, 0.3, 0.5, 0.7],
        },
      )

      observer.observe(section)
      observersRef.current.push(observer)
    })

    console.log("[SectionObserver] Observers initialized")
  }

  useEffect(() => {
    // Prevent hydration issues by only running on client
    if (typeof window === "undefined") return

    // Initialize observers
    initializeObservers()

    // Listen for reinitialize event
    const handleReinitialize = () => {
      console.log("[SectionObserver] Reinitializing observers")
      initializeObservers()
    }

    document.addEventListener("observers:reinitialize", handleReinitialize)

    // Also initialize on scroll
    const handleScroll = () => {
      initializeObservers()
    }

    window.addEventListener("scroll", handleScroll, { once: true, passive: true })

    return () => {
      observersRef.current.forEach((observer) => observer.disconnect())
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("observers:reinitialize", handleReinitialize)
    }
  }, [sectionIds])

  return null // This component doesn't render anything
}
