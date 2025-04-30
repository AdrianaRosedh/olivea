"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { EVENTS, emitEvent } from "@/lib/navigation-events"

export default function ScrollSync() {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const isScrollingProgrammatically = useRef(false)
  const pathname = usePathname() // Track pathname for navigation changes
  const isInitializedRef = useRef(false)
  const lastActiveSection = useRef<string | null>(null)
  const scrollAnimationRef = useRef<number | null>(null)
  const clickedSectionRef = useRef<string | null>(null)
  const debugModeRef = useRef(false) // Set to true to enable debug logs
  const snapInProgressRef = useRef(false)
  const lastScrollTimeRef = useRef(0)

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
    // Check if we're on a mobile device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // Use a shorter duration for mobile devices
    const scrollDuration = isMobileDevice ? 500 : duration

    // Cancel any ongoing animation
    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current)
    }

    const scrollContainer = scrollContainerRef.current || document.documentElement
    const startPosition = scrollContainer.scrollTop
    const distance = targetPosition - startPosition
    let startTime: number | null = null

    // Set flags
    isScrollingProgrammatically.current = true
    snapInProgressRef.current = true
    lastScrollTimeRef.current = Date.now()

    // Emit events
    emitEvent(EVENTS.SECTION_SNAP_START, {
      targetId: clickedSectionRef.current,
      startPosition,
      targetPosition,
    })

    // On mobile, we can use a more responsive easing function
    const easing = isMobileDevice
      ? (t: number) => t * (2 - t) // Ease out quad (faster)
      : (t: number) => 1 - Math.pow(1 - t, 3) // Ease out cubic (smoother)

    // Animation function
    const animateScroll = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / scrollDuration, 1)
      const easedProgress = easing(progress)

      if (scrollContainer) {
        scrollContainer.scrollTop = startPosition + distance * easedProgress

        // Emit progress event
        emitEvent(EVENTS.SCROLL_PROGRESS, {
          progress: easedProgress,
          targetId: clickedSectionRef.current,
          scrollPosition: startPosition + distance * easedProgress,
          totalProgress:
            (startPosition + distance * easedProgress) / (scrollContainer.scrollHeight - scrollContainer.clientHeight),
        })
      }

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animateScroll)
      } else {
        // Animation complete
        scrollAnimationRef.current = null

        // Emit events
        emitEvent(EVENTS.SECTION_SNAP_COMPLETE, {
          targetId: clickedSectionRef.current,
          finalPosition: scrollContainer.scrollTop,
        })

        // Reset flags after a short delay - shorter on mobile
        setTimeout(
          () => {
            isScrollingProgrammatically.current = false
            snapInProgressRef.current = false
            clickedSectionRef.current = null

            // Force a scroll event
            window.dispatchEvent(new Event("scroll"))
          },
          isMobileDevice ? 50 : 100,
        )
      }
    }

    // Start animation
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

          // Skip if we're already animating
          if (snapInProgressRef.current) return

          debugLog(`Clicking to section ${targetId}`)

          // Store the clicked section ID
          clickedSectionRef.current = targetId

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

          // Also emit section change event
          emitEvent(EVENTS.SECTION_CHANGE, {
            id: targetId,
            source: "click",
          })
        }
      }
    }

    // Function to handle scroll events with throttling
    let scrollTimeout: NodeJS.Timeout | null = null
    const handleScroll = () => {
      // Skip if we're programmatically scrolling to avoid competing updates
      if (isScrollingProgrammatically.current || snapInProgressRef.current) return

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

          // Also emit section change event
          emitEvent(EVENTS.SECTION_CHANGE, {
            id: activeSection.id,
            source: "scroll",
            intersectionRatio: maxVisibility,
          })
        }
      }, 50) // 50ms throttle
    }

    // Listen for navigation events
    const handleNavigationComplete = () => {
      debugLog("Navigation complete, reinitializing")
      // Re-initialize after navigation
      setTimeout(initializeScrollFunctionality, 100)
    }

    document.addEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)

    // Also listen for scroll initialization events
    const handleScrollInit = () => {
      debugLog("Scroll initialize event received")
      initializeScrollFunctionality()
    }

    document.addEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)

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
      document.removeEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)
      document.removeEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)
    }
  }, [pathname]) // Re-run when pathname changes

  return null // This component doesn't render anything
}
