"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function ScrollSync() {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const isScrollingProgrammatically = useRef(false)
  const pathname = usePathname() // Track pathname for navigation changes
  const isInitializedRef = useRef(false)

  // Function to initialize scroll functionality
  const initializeScrollFunctionality = () => {
    if (typeof window === "undefined") return

    console.log("[ScrollSync] Initializing scroll functionality")

    // Find the scroll container
    scrollContainerRef.current = document.querySelector(".scroll-container") || document.documentElement

    // Force a scroll event to activate listeners
    window.scrollBy(0, 1)
    window.scrollBy(0, -1)
    window.dispatchEvent(new Event("scroll"))

    // Mark as initialized
    isInitializedRef.current = true
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Initialize on mount or navigation
    initializeScrollFunctionality()

    // Function to handle section clicks
    const handleSectionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')

      if (link) {
        const href = link.getAttribute("href")
        if (!href || href === "#") return

        const targetId = href.replace("#", "")
        const targetSection = document.getElementById(targetId)

        // Re-query the scroll container to ensure we have the latest reference
        const scrollContainer = document.querySelector(".scroll-container") || document.documentElement

        if (targetSection && scrollContainer) {
          e.preventDefault()

          console.log(`[ScrollSync] Clicking to section ${targetId}`)

          // Mark that we're programmatically scrolling
          isScrollingProgrammatically.current = true

          // Calculate the top position of the section
          const sectionTop = targetSection.offsetTop

          // Scroll to the section
          scrollContainer.scrollTo({
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

    // Listen for navigation events
    const handleNavigationComplete = () => {
      console.log("[ScrollSync] Navigation complete, reinitializing")
      // Re-initialize after navigation
      setTimeout(initializeScrollFunctionality, 100)
    }

    document.addEventListener("navigation:complete", handleNavigationComplete)

    // Also listen for scroll initialization events
    const handleScrollInit = () => {
      console.log("[ScrollSync] Scroll initialize event received")
      initializeScrollFunctionality()
    }

    document.addEventListener("scroll:initialize", handleScrollInit)

    // Add event listeners
    document.addEventListener("click", handleSectionClick)
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Initial check
    setTimeout(handleScroll, 100)

    // Cleanup
    return () => {
      document.removeEventListener("click", handleSectionClick)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("navigation:complete", handleNavigationComplete)
      document.removeEventListener("scroll:initialize", handleScrollInit)
    }
  }, [pathname]) // Re-run when pathname changes

  return null // This component doesn't render anything
}
