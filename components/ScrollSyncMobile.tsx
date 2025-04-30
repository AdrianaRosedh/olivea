"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { SECTION_EVENTS } from "@/lib/section-navigation"

export default function ScrollSyncMobile() {
  const pathname = usePathname()
  const lastSectionRef = useRef<string | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobileRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if on mobile device
    const checkMobile = () => {
      if (typeof navigator !== "undefined") {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
        isMobileRef.current = isMobileDevice
        return isMobileDevice
      }
      return false
    }

    // Only run on mobile
    if (!checkMobile()) return

    console.log("[ScrollSyncMobile] Mobile device detected, initializing scroll sync")

    // Function to check which section is currently in view
    const checkVisibleSections = () => {
      // Find all sections
      const sections = document.querySelectorAll("section[id]")
      if (sections.length === 0) return

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

      // Notify about the active section if it has changed
      if (activeSection && activeSection.id !== lastSectionRef.current) {
        lastSectionRef.current = activeSection.id
        console.log(`[ScrollSyncMobile] Active section detected: ${activeSection.id}`)

        // Dispatch both event types to ensure compatibility
        document.dispatchEvent(
          new CustomEvent(SECTION_EVENTS.SECTION_IN_VIEW, {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
              source: "mobile-scroll",
            },
          }),
        )

        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
              source: "mobile-scroll",
            },
          }),
        )
      }
    }

    // Function to handle scroll events with throttling
    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set a new timeout to check sections after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        checkVisibleSections()
      }, 50) // 50ms throttle
    }

    // Add scroll event listeners
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Also listen to scroll container
    const scrollContainer = document.querySelector(".scroll-container")
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    }

    // Initial check
    setTimeout(checkVisibleSections, 100)
    setTimeout(checkVisibleSections, 500)
    setTimeout(checkVisibleSections, 1000)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [pathname])

  return null
}
