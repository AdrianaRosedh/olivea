// components/navigation/MobileSectionTracker.tsx
"use client"

import { useEffect, useRef, useCallback } from "react"
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

  // 1) Wrap in useCallback so we can safely list as a dependency
  const initializeObservers = useCallback(() => {
    // Clean up any existing observers
    observersRef.current.forEach((obs) => obs.disconnect())
    observersRef.current = []

    // Skip if manual nav is in progress
    if (isManualNavigation) return

    // Observe each section
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) {
        console.warn(`Section with id "${id}" not found`)
        return
      }
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3 && !isManualNavigation) {
              setActiveSection(id)
            }
          })
        },
        {
          root: null,
          rootMargin: `-${top}px 0px -66% 0px`,
          threshold: [0.25],
        }
      )
      obs.observe(el)
      observersRef.current.push(obs)
    })
  }, [sectionIds, isManualNavigation, setActiveSection])

  useEffect(() => {
    // Initialize after a slight delay
    const timer = window.setTimeout(initializeObservers, 200)

    return () => {
      // Clean up observers + timer
      observersRef.current.forEach((obs) => obs.disconnect())
      clearTimeout(timer)
    }
  }, [initializeObservers, pathname])  // now including initializeObservers

  return null
}