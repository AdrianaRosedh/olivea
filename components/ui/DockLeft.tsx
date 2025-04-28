"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { EVENTS, emitEvent, getCurrentSection } from "@/lib/navigation-events"

interface DockItem {
  id: string
  label: string
  number: string
}

interface Props {
  items: DockItem[]
}

export default function DockLeft({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items.length > 0 ? items[0].id : null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const mountedRef = useRef(false)
  const pathname = usePathname()
  const scrollAnimationRef = useRef<number | null>(null)
  const clickedSectionRef = useRef<string | null>(null)
  const debugModeRef = useRef(false)
  const lastScrollTimeRef = useRef(0)
  const animationInProgressRef = useRef(false)

  // Debug logger that only logs if debug mode is enabled
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[DockLeft]", ...args)
    }
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

    // Set animating state to prevent button jumps
    setIsAnimating(true)
    animationInProgressRef.current = true

    // Record the time we started scrolling
    lastScrollTimeRef.current = Date.now()

    // Emit scroll start event for other components to sync with
    emitEvent(EVENTS.SCROLL_START, { targetId: clickedSectionRef.current })

    // Also emit section snap start event
    emitEvent(EVENTS.SECTION_SNAP_START, {
      targetId: clickedSectionRef.current,
      startPosition,
      targetPosition,
    })

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

        // Emit scroll progress event for other components to sync with
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

        // Emit scroll end event
        emitEvent(EVENTS.SCROLL_COMPLETE, { targetId: clickedSectionRef.current })

        // Also emit section snap complete event
        emitEvent(EVENTS.SECTION_SNAP_COMPLETE, {
          targetId: clickedSectionRef.current,
          finalPosition: scrollContainer.scrollTop,
        })

        // Reset animating state after a short delay
        setTimeout(() => {
          setIsAnimating(false)
          animationInProgressRef.current = false

          // Clear clicked section after animation completes
          clickedSectionRef.current = null

          // Force a scroll event to reactivate observers
          window.dispatchEvent(new Event("scroll"))
        }, 50)
      }
    }

    // Start animation
    scrollAnimationRef.current = requestAnimationFrame(animateScroll)
  }

  // Initialize scroll container and event listeners
  const initializeScrollFunctionality = useCallback(() => {
    debugLog("Initializing scroll functionality")

    // Find the scroll container
    scrollContainerRef.current = document.querySelector(".scroll-container") || document.documentElement

    // Set initial active section based on current scroll position
    const currentSection = getCurrentSection()
    if (currentSection) {
      setActiveId(currentSection)
    } else if (items.length > 0) {
      setActiveId(items[0].id)
    }
  }, [items])

  // Find the scroll container on mount and when pathname changes
  useEffect(() => {
    if (typeof window === "undefined") return

    // Initialize on mount or navigation
    initializeScrollFunctionality()
    mountedRef.current = true

    // Listen for section visibility events
    const handleSectionInView = (e: Event) => {
      const customEvent = e as CustomEvent

      // Skip updates if we're currently animating
      if (animationInProgressRef.current && !customEvent.detail?.fromClick) {
        return
      }

      // If we recently scrolled (within 500ms), don't update from scroll events
      if (Date.now() - lastScrollTimeRef.current < 500 && customEvent.detail?.fromScroll) {
        return
      }

      // If we have a clicked section, prioritize it
      if (clickedSectionRef.current && customEvent.detail?.id === clickedSectionRef.current) {
        debugLog(`Setting active ID to clicked section: ${clickedSectionRef.current}`)
        setActiveId(clickedSectionRef.current)
        return
      }

      // Otherwise, update normally
      if (customEvent.detail?.id) {
        debugLog(`Setting active ID to: ${customEvent.detail.id}`)
        setActiveId(customEvent.detail.id)

        // Emit section change event
        emitEvent(EVENTS.SECTION_CHANGE, {
          id: customEvent.detail.id,
          source: customEvent.detail.fromClick ? "click" : customEvent.detail.fromScroll ? "scroll" : "other",
        })
      }
    }

    document.addEventListener("sectionInView", handleSectionInView)

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

    // Listen for scroll events from other components
    const handleScrollSync = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.targetId && !isAnimating) {
        // Update our active ID to match the scrolled section
        setActiveId(customEvent.detail.targetId)
      }
    }

    document.addEventListener(EVENTS.SCROLL_START, handleScrollSync)

    // Listen for section change events
    const handleSectionChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.id && !animationInProgressRef.current) {
        setActiveId(customEvent.detail.id)
      }
    }

    document.addEventListener(EVENTS.SECTION_CHANGE, handleSectionChange)

    // Check active section periodically to ensure sync
    const syncInterval = setInterval(() => {
      if (!animationInProgressRef.current) {
        const currentSection = getCurrentSection()
        if (currentSection && currentSection !== activeId) {
          setActiveId(currentSection)
        }
      }
    }, 1000)

    return () => {
      // Cancel any ongoing animation
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }

      clearInterval(syncInterval)
      document.removeEventListener("sectionInView", handleSectionInView)
      document.removeEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)
      document.removeEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)
      document.removeEventListener(EVENTS.SCROLL_START, handleScrollSync)
      document.removeEventListener(EVENTS.SECTION_CHANGE, handleSectionChange)
    }
  }, [items, pathname, initializeScrollFunctionality, isAnimating, activeId])

  // Improved scroll function with useCallback for better performance
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()

      // Prevent multiple clicks during animation
      if (isAnimating || animationInProgressRef.current) {
        return
      }

      // Store the clicked section ID
      clickedSectionRef.current = id

      // Re-query the DOM to ensure we have the latest references
      const el = document.getElementById(id)
      const scrollContainer = document.querySelector(".scroll-container") || document.documentElement

      debugLog(`Click handler for ${id}, element:`, el, "container:", scrollContainer)

      if (el && scrollContainer) {
        // Calculate the top position of the section relative to the scroll container
        const sectionTop = el.offsetTop

        debugLog(`Scrolling to section ${id} at position ${sectionTop}`)

        // Update active state immediately for better UX
        setActiveId(id)

        // Update URL without reload
        window.history.pushState(null, "", `#${id}`)

        // Use our custom smooth scroll
        smoothScrollTo(sectionTop, 800)

        // Also dispatch the event to ensure other components update
        debugLog(`Dispatching sectionInView event for ${id}`)
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id,
              intersectionRatio: 1.0,
              fromClick: true,
            },
          }),
        )
      } else {
        console.warn(`[DockLeft] Could not find section ${id} or scroll container`)
      }
    },
    [isAnimating],
  )

  return (
    <nav className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40" aria-label="Section navigation">
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isHovered = hoveredId === item.id
          const isActive = activeId === item.id
          const isAnimated = isActive || isHovered

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              onMouseEnter={() => !isAnimating && setHoveredId(item.id)}
              onMouseLeave={() => !isAnimating && setHoveredId(null)}
              className={cn(
                "group relative flex items-center gap-4 transition-all duration-500 cursor-pointer",
                isActive ? "text-[var(--olivea-clay)]" : "text-[var(--olivea-olive)] opacity-80 hover:opacity-100",
                isAnimating ? "pointer-events-none" : "", // Disable pointer events during animation
              )}
              aria-current={isActive ? "location" : undefined}
              aria-label={`Navigate to ${item.label} section`}
              data-active={isActive ? "true" : "false"}
            >
              {/* Number */}
              <div className="flex-shrink-0 w-10">
                <span className="text-2xl tabular-nums font-extrabold" aria-hidden="true">
                  {item.number}
                </span>
              </div>

              {/* Text container with CSS Grid for better layout control */}
              <div className="relative h-8 overflow-hidden min-w-[200px]">
                <div className="grid grid-cols-1 grid-rows-1">
                  {/* Top text that slides up and out */}
                  <motion.div
                    className="col-start-1 row-start-1 text-2xl font-bold whitespace-nowrap"
                    animate={{
                      y: isAnimated ? -24 : 0,
                      filter: isAnimated ? "blur(0.6px)" : "blur(0px)",
                    }}
                    transition={{
                      y: { type: "spring", stiffness: 140, damping: 18 },
                      filter: { duration: 0.25, ease: "easeOut" },
                    }}
                    aria-hidden="true"
                  >
                    {item.label.toUpperCase()}
                  </motion.div>

                  {/* Bottom text that slides up into view */}
                  <motion.div
                    className="col-start-1 row-start-1 text-2xl font-bold whitespace-nowrap"
                    initial={{ y: 24, filter: "blur(0.6px)" }}
                    animate={{
                      y: isAnimated ? 0 : 24,
                      filter: isAnimated ? "blur(0px)" : "blur(0.6px)",
                    }}
                    transition={{
                      y: { type: "spring", stiffness: 140, damping: 18 },
                      filter: { duration: 0.25, ease: "easeOut" },
                    }}
                    aria-hidden="true"
                  >
                    {item.label.toUpperCase()}
                  </motion.div>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
