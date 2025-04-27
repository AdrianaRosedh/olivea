"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function ScrollSync() {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const isScrollingProgrammatically = useRef(false)
  const pathname = usePathname() // Track pathname for navigation changes
  const isInitializedRef = useRef(false)
  const lastActiveSection = useRef<string | null>(null)
  const scrollAnimationRef = useRef<number | null>(null)
  const clickedSectionRef = useRef<string | null>(null)
  const debugModeRef = useRef(false) // Set to true to enable debug logs

  // Debug logger that only logs if debug mode is enabled
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[ScrollSync]", ...args)
    }
  }

  // Function to initialize scroll functionality
  const initializeScrollFunctionality = () => {
    if (typeof window === "undefined") return

    debugLog("Initializing scroll functionality")

    // Find the scroll container
    scrollContainerRef.current = document.querySelector(".scroll-container") || document.documentElement

    // Force a scroll event to activate listeners
    window.scrollBy(0, 1)
    window.scrollBy(0, -1)
    window.dispatchEvent(new Event("scroll"))

    // Mark as initialized
    isInitializedRef.current = true
  }

  // Custom smooth scroll function to avoid browser's native implementation
  const smoothScrollTo = (targetPosition: number, duration = 800) => {
    // Cancel any ongoing animation
    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current)
    }

    const scrollContainer = scrollContainerRef.current || document.documentElement
    const startPosition = scrollContainer.scrollTop
    const distance = targetPosition - startPosition
    let startTime: number | null = null

    // Easing function for smooth animation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    // Animation function
    const animateScroll = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      if (scrollContainer) {
        scrollContainer.scrollTop = startPosition + distance * easedProgress
      }

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animateScroll)
      } else {
        // Animation complete
        scrollAnimationRef.current = null
        isScrollingProgrammatically.current = false

        // Clear clicked section after animation completes
        setTimeout(() => {
          clickedSectionRef.current = null
        }, 100)
      }
    }

    // Start animation
    isScrollingProgrammatically.current = true
    scrollAnimationRef.current = requestAnimationFrame(animateScroll)
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

          debugLog(`Clicking to section ${targetId}`)

          // Store the clicked section ID
          clickedSectionRef.current = targetId

          // Mark that we're programmatically scrolling
          isScrollingProgrammatically.current = true

          // Calculate the top position of the section relative to the scroll container
          const sectionTop = targetSection.offsetTop

          // Update URL without reload
          window.history.pushState(null, "", href)

          // Use our custom smooth scroll instead of scrollTo
          smoothScrollTo(sectionTop, 800)

          // Update the last active section
          lastActiveSection.current = targetId

          // Dispatch custom event for section in view
          debugLog(`Dispatching sectionInView event for ${targetId}`)
          document.dispatchEvent(
            new CustomEvent("sectionInView", {
              detail: {
                id: targetId,
                intersectionRatio: 1.0,
                fromClick: true, // Add flag to indicate this was from a click
              },
            }),
          )

          // After animation completes, re-enable scroll animations
          setTimeout(() => {
            isScrollingProgrammatically.current = false
            clickedSectionRef.current = null

            // Force a scroll event to reactivate observers
            window.dispatchEvent(new Event("scroll"))

            // Re-enable scroll animations by dispatching a custom event
            document.dispatchEvent(new CustomEvent("enableScrollAnimations", {}))
          }, 900) // Slightly longer than the animation duration
        }
      }
    }

    // Function to handle scroll events with throttling
    let scrollTimeout: NodeJS.Timeout | null = null
    const handleScroll = () => {
      // Skip if we're programmatically scrolling to avoid competing updates
      if (isScrollingProgrammatically.current) return

      // If we have a clicked section that's still being processed, don't override it
      if (clickedSectionRef.current) return

      // Throttle scroll events
      if (scrollTimeout) return

      scrollTimeout = setTimeout(() => {
        scrollTimeout = null

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

        // Dispatch section in view event only if the active section has changed
        if (activeSection && activeSection.id !== lastActiveSection.current) {
          lastActiveSection.current = activeSection.id
          debugLog(`New active section from scroll: ${activeSection.id}`)

          document.dispatchEvent(
            new CustomEvent("sectionInView", {
              detail: {
                id: activeSection.id,
                intersectionRatio: maxVisibility,
                fromScroll: true, // Add flag to indicate this was from a scroll
              },
            }),
          )
        }
      }, 50) // 50ms throttle
    }

    // Listen for navigation events
    const handleNavigationComplete = () => {
      debugLog("Navigation complete, reinitializing")
      // Re-initialize after navigation
      setTimeout(initializeScrollFunctionality, 100)
    }

    document.addEventListener("navigation:complete", handleNavigationComplete)

    // Also listen for scroll initialization events
    const handleScrollInit = () => {
      debugLog("Scroll initialize event received")
      initializeScrollFunctionality()
    }

    document.addEventListener("scroll:initialize", handleScrollInit)

    // Add event listeners
    document.addEventListener("click", handleSectionClick)
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Initial check - but don't update active section on initial load
    setTimeout(() => {
      const sections = document.querySelectorAll("section[id]")
      if (sections.length > 0) {
        // Just initialize lastActiveSection without dispatching an event
        const firstSection = sections[0]
        lastActiveSection.current = firstSection.id
      }
    }, 100)

    // Cleanup
    return () => {
      // Cancel any ongoing animation
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }

      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      document.removeEventListener("click", handleSectionClick)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("navigation:complete", handleNavigationComplete)
      document.removeEventListener("scroll:initialize", handleScrollInit)
    }
  }, [pathname]) // Re-run when pathname changes

  return null // This component doesn't render anything
}
