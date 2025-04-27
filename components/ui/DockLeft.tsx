"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname() // Track pathname for navigation changes
  const scrollAnimationRef = useRef<number | null>(null)
  const clickedSectionRef = useRef<string | null>(null)
  const debugModeRef = useRef(false) // Set to true to enable debug logs

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
        // Reset animating state after a short delay
        setTimeout(() => {
          setIsAnimating(false)
          // Clear clicked section after animation completes
          clickedSectionRef.current = null
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

    // Set initial active section
    if (items.length > 0) {
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

      // If this event is from a click and we're on mobile, always update the active ID
      const isMobileDevice =
        typeof navigator !== "undefined" &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      // If we have a clicked section, prioritize it
      if (clickedSectionRef.current && customEvent.detail?.id === clickedSectionRef.current) {
        debugLog(`Setting active ID to clicked section: ${clickedSectionRef.current}`)
        setActiveId(clickedSectionRef.current)
        return
      }

      // Otherwise, update normally if not animating
      if (customEvent.detail?.id && (!isAnimating || customEvent.detail?.fromClick)) {
        debugLog(`Setting active ID to: ${customEvent.detail.id}`)
        setActiveId(customEvent.detail.id)
      }
    }

    document.addEventListener("sectionInView", handleSectionInView)

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

    return () => {
      // Cancel any ongoing animation
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }

      document.removeEventListener("sectionInView", handleSectionInView)
      document.removeEventListener("navigation:complete", handleNavigationComplete)
      document.removeEventListener("scroll:initialize", handleScrollInit)
    }
  }, [items, pathname, initializeScrollFunctionality, isAnimating])

  // Improved scroll function with useCallback for better performance
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()

      // Prevent multiple clicks during animation
      if (isAnimating) {
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

  // Find the longest label to determine width
  const maxLabelLength = Math.max(...items.map((item) => item.label.length))
  // Calculate width based on label length (approximately 12px per character for this font)
  const labelWidth = Math.max(120, maxLabelLength * 12) // Minimum 120px, or calculated width

  return (
    <nav
      className="hidden md:flex flex-col gap-6 items-start text-xl font-bold tracking-widest uppercase"
      aria-label="Section navigation"
    >
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
              "group relative flex items-center space-x-4 transition-all duration-500 cursor-pointer",
              isActive ? "text-[var(--olivea-clay)]" : "text-[var(--olivea-olive)] opacity-80 hover:opacity-100",
              isAnimating ? "pointer-events-none" : "", // Disable pointer events during animation
            )}
            aria-current={isActive ? "location" : undefined}
            aria-label={`Navigate to ${item.label} section`}
            data-active={isActive ? "true" : "false"} // Add data attribute for debugging
          >
            <span className="text-2xl tabular-nums font-extrabold" aria-hidden="true">
              {item.number}
            </span>

            {/* Text reveal container with fixed height and overflow hidden */}
            <div className="relative h-8 overflow-hidden" style={{ width: `${labelWidth}px` }}>
              <div className="relative">
                {/* Top text that slides up and out */}
                <motion.div
                  className="block text-2xl font-bold absolute whitespace-nowrap"
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
                  className="block text-2xl font-bold absolute top-0 left-0 whitespace-nowrap"
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
    </nav>
  )
}
