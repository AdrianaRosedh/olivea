"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function NextGenBackgroundInitializer() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to force initialize the NextGenBackground
    const initializeBackground = () => {
      console.log("[NextGenBackgroundInitializer] Reinitializing background")

      // Find the NextGenBackground element
      const backgroundElement = document.querySelector(".next-gen-background")

      if (backgroundElement) {
        // Force layout recalculation
        backgroundElement.getBoundingClientRect()

        // Dispatch a custom event that NextGenBackground can listen for
        document.dispatchEvent(new CustomEvent("background:reinitialize"))

        // Find all sections and force a section change event
        const sections = document.querySelectorAll("section[id]")
        if (sections.length > 0) {
          // Find which section is currently in view
          let activeSection: Element | null = null
          let maxVisibility = 0

          sections.forEach((section) => {
            const rect = section.getBoundingClientRect()
            const windowHeight = window.innerHeight

            // Calculate how much of the section is visible
            const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
            const visibility = visibleHeight / rect.height

            if (visibility > maxVisibility) {
              maxVisibility = visibility
              activeSection = section
            }
          })

          // Dispatch section in view event for the active section
          if (activeSection) {
            document.dispatchEvent(
              new CustomEvent("sectionInView", {
                detail: {
                  id: activeSection.id,
                  intersectionRatio: maxVisibility,
                  fromInitializer: true,
                },
              }),
            )
          }
        }
      }
    }

    // Run initialization with increasing delays
    const timers = [
      setTimeout(initializeBackground, 100),
      setTimeout(initializeBackground, 300),
      setTimeout(initializeBackground, 600),
      setTimeout(initializeBackground, 1000),
    ]

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [pathname]) // Re-run when pathname changes

  return null // This component doesn't render anything
}
