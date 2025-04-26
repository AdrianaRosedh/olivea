"use client"

import { useEffect, useState, useTransition } from "react"

export function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string | null>(sectionIds[0])
  const [isPending, startTransition] = useTransition()

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

    // Observe all sections
    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (section) {
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [sectionIds])

  return { active, isPending }
}
