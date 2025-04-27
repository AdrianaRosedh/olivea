"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamically import ScrollSync with no SSR to prevent server-side execution
const ScrollSync = dynamic(() => import("./ScrollSync"), { ssr: false })

export default function ScrollManager() {
  const pathname = usePathname()

  // Force scroll events on navigation
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return
    
    console.log(`[ScrollManager] Path changed: ${pathname}`)

    // Function to dispatch scroll events
    const dispatchScrollEvents = () => {
      // Force a minimal scroll to activate scroll listeners
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)

      // Dispatch scroll event
      window.dispatchEvent(new Event("scroll"))

      // Find all sections
      const sections = document.querySelectorAll("section[id]")
      if (sections.length > 0) {
        // Find which section is currently in view
        let activeSection: Element | null = null

        for (const section of sections) {
          const rect = section.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            activeSection = section
            break
          }
        }

        // If no section is in view, use the first one
        if (!activeSection && sections.length > 0) {
          activeSection = sections[0]
        }

        // Dispatch section in view event
        if (activeSection) {
          document.dispatchEvent(
            new CustomEvent("sectionInView", {
              detail: {
                id: activeSection.id,
                intersectionRatio: 1.0,
              },
            }),
          )
        }
      }
    }

    // Schedule multiple attempts with increasing delays
    const timers = [
      setTimeout(dispatchScrollEvents, 0),
      setTimeout(dispatchScrollEvents, 100),
      setTimeout(dispatchScrollEvents, 300),
      setTimeout(dispatchScrollEvents, 600),
      setTimeout(dispatchScrollEvents, 1000),
    ]

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [pathname])

  return <ScrollSync />
}
