"use client"

import { useEffect, useRef } from "react"

export default function ScrollSync() {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const isScrollingProgrammatically = useRef(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Find the scroll container
    scrollContainerRef.current = document.querySelector(".scroll-container") || document.documentElement

    // Function to handle section clicks
    const handleSectionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')

      if (link) {
        const href = link.getAttribute("href")
        if (!href || href === "#") return

        const targetId = href.replace("#", "")
        const targetSection = document.getElementById(targetId)

        if (targetSection && scrollContainerRef.current) {
          e.preventDefault()

          // Mark that we're programmatically scrolling
          isScrollingProgrammatically.current = true

          // Calculate the top position of the section
          const sectionTop = targetSection.offsetTop

          // Scroll to the section
          scrollContainerRef.current.scrollTo({
            top: sectionTop,
            behavior: "smooth",
          })

          // Update URL without reload
          window.history.pushState(null, "", href)

          // Dispatch custom event for section in view
          setTimeout(() => {
            document.dispatchEvent(
              new CustomEvent("sectionInView", {
                detail: {
                  id: targetId,
                  intersectionRatio: 1.0,
                },
              }),
            )

            // Reset the flag after scrolling completes
            setTimeout(() => {
              isScrollingProgrammatically.current = false
            }, 100)
          }, 500)

          // Provide haptic feedback if available
          if (window.navigator.vibrate) {
            window.navigator.vibrate(10)
          }
        }
      }
    }

    // Function to handle scroll events
    const handleScroll = () => {
      // Skip if we're programmatically scrolling
      if (isScrollingProgrammatically.current) return

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

      // Dispatch section in view event
      if (activeSection) {
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
            },
          }),
        )
      }
    }

    // Add event listeners
    document.addEventListener("click", handleSectionClick)
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Initial check
    setTimeout(handleScroll, 100)

    // Cleanup
    return () => {
      document.removeEventListener("click", handleSectionClick)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return null // This component doesn't render anything
}
