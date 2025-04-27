"use client"

import { useEffect, useState, useTransition, useRef } from "react"

export function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string | null>(sectionIds[0])
  const [isPending, startTransition] = useTransition()
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // Create a single IntersectionObserver for better performance
    const observerOptions = {
      rootMargin: "-20% 0px -40% 0px",
      threshold: [0.1, 0.5, 0.9],
    }

    const observer = new IntersectionObserver((entries) => {
      // Find the most visible section
      let maxVisibility = 0
      let mostVisibleId: string | null = null

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          const visibility = entry.intersectionRatio

          if (visibility > maxVisibility) {
            maxVisibility = visibility
            mostVisibleId = id
          }
        }
      })

      if (mostVisibleId) {
        // Use React 19's useTransition for smoother UI updates
        startTransition(() => {
          setActive(mostVisibleId)
        })
      }
    }, observerOptions)

    // Function to observe all sections
    const observeSections = () => {
      // First, disconnect any existing observations
      observer.disconnect()

      // Then observe all sections
      sectionIds.forEach((id) => {
        const section = document.getElementById(id)
        if (section) {
          observer.observe(section)
        }
      })

      // Mark as initialized
      isInitializedRef.current = true
    }

    // Initial observation
    observeSections()

    // Re-observe after delays to ensure all sections are properly tracked
    setTimeout(observeSections, 100)
    setTimeout(observeSections, 500)
    setTimeout(observeSections, 1000)

    // Re-observe on window resize
    window.addEventListener("resize", observeSections)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", observeSections)
    }
  }, [sectionIds])

  return { active, isPending }
}
