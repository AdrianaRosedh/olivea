"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useNavigation } from "@/contexts/NavigationContext"

interface MobileSectionTrackerProps {
  sectionIds: readonly string[]
}

/**
 * Component that specifically handles mobile section tracking
 * This ensures the mobile navigation properly highlights active sections
 */
export default function MobileSectionTracker({ sectionIds }: MobileSectionTrackerProps) {
  const pathname = usePathname()
  const observersRef = useRef<IntersectionObserver[]>([])
  const { setActiveSection, isManualNavigation } = useNavigation()

  // Function to initialize observers
  const initializeObservers = () => {
    // Clean up any existing observers
    if (observersRef.current.length > 0) {
      observersRef.current.forEach((observer) => observer.disconnect())
      observersRef.current = []
    }

    // Skip if we're currently in manual navigation mode
    if (isManualNavigation) return

    // Create observers for each section
    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (!section) {
        console.warn(`Section with id "${id}" not found`)
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3 && !isManualNavigation) {
              setActiveSection(id)
            }
          })
        },
        {
          root: null,
          rootMargin: "-10% 0px -20% 0px",
          threshold: [0.1, 0.2, 0.3, 0.4, 0.5],
        },
      )

      observer.observe(section)
      observersRef.current.push(observer)
    })
  }

  useEffect(() => {
    // Initialize observers with a slight delay
    const timer = setTimeout(() => {
      initializeObservers()
    }, 200)

    return () => {
      // Clean up all observers
      observersRef.current.forEach((observer) => observer.disconnect())
      clearTimeout(timer)
    }
  }, [sectionIds, pathname, isManualNavigation]) // Re-initialize on path change or navigation state change

  // This component doesn't render anything
  return null
}
