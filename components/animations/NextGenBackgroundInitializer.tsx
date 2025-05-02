"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function NextGenBackgroundInitializer() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    const initializeBackground = () => {
      console.log("[NextGenBackgroundInitializer] Reinitializing background")

      const backgroundElement = document.querySelector<HTMLElement>(".next-gen-background")
      if (!backgroundElement) return
      backgroundElement.getBoundingClientRect()
      document.dispatchEvent(new CustomEvent("background:reinitialize"))

      // Grab any elements matching section[id] and filter to HTMLElements
      const rawSections = document.querySelectorAll("section[id]")
      const sections = Array.from(rawSections).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && typeof el.id === 'string'
      )
      if (sections.length === 0) return

      let activeSection: HTMLElement | null = null
      let maxVisibility = 0

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
        const visibility = visibleHeight / rect.height

        if (visibility > maxVisibility) {
          maxVisibility = visibility
          activeSection = section
        }
      })

      if (activeSection) {
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
              fromInitializer: true,
            },
          })
        )
      }
    }

    // Run initialization with increasing delays
    const timers = [
      setTimeout(initializeBackground, 100),
      setTimeout(initializeBackground, 300),
      setTimeout(initializeBackground, 600),
      setTimeout(initializeBackground, 1000),
    ]

    return () => timers.forEach(clearTimeout)
  }, [pathname])

  return null
}
