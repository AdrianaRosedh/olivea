"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileSectionNavItem {
  id: string
  label: string
}

interface Props {
  items: MobileSectionNavItem[]
}

export default function MobileSectionNav({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items.length > 0 ? items[0].id : null)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const userClickedSectionRef = useRef<string | null>(null)
  const userClickTimeRef = useRef<number>(0)
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const debugModeRef = useRef(false) // Set to true to enable console logs

  // Debug logger
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[MobileSectionNav]", ...args)
    }
  }

  // Function to scroll active button into view
  const scrollActiveButtonIntoView = (id: string) => {
    if (!containerRef.current || !buttonRefs.current[id]) return

    const container = containerRef.current
    const button = buttonRefs.current[id]

    // Calculate the center position
    const containerWidth = container.offsetWidth
    const buttonWidth = button.offsetWidth
    const buttonLeft = button.offsetLeft

    // Calculate scroll position to center the button
    const scrollPosition = buttonLeft - containerWidth / 2 + buttonWidth / 2

    // Scroll the container
    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: "smooth",
    })
  }

  // Function to check if user clicked section should be prioritized
  const shouldPrioritizeUserClick = () => {
    if (!userClickedSectionRef.current) return false

    // If user clicked within the last 2 seconds, prioritize that section
    // Reduced from 5 seconds to 2 seconds for better responsiveness
    const timeSinceClick = Date.now() - userClickTimeRef.current
    return timeSinceClick < 2000 // 2 seconds lock (reduced from 5)
  }

  // Set up section tracking with requestAnimationFrame for smoother updates
  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to determine which section is active
    const updateActiveSection = () => {
      // If user clicked a section recently, prioritize that section
      if (shouldPrioritizeUserClick()) {
        return
      }

      // Throttle updates to prevent too many state changes
      // But make it more responsive than before (50ms instead of 100ms)
      const now = Date.now()
      if (now - lastUpdateTimeRef.current < 50) return
      lastUpdateTimeRef.current = now

      const sections = document.querySelectorAll("section[id]")
      if (sections.length === 0) return

      let bestSection = null
      let bestVisibility = 0

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Calculate how much of the section is visible
        const visibleTop = Math.max(0, rect.top)
        const visibleBottom = Math.min(windowHeight, rect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const visibility = visibleHeight / rect.height

        // Weight the center of the screen more heavily
        const distanceFromCenter = Math.abs((rect.top + rect.bottom) / 2 - windowHeight / 2)
        const centerWeight = 1 - Math.min(1, distanceFromCenter / (windowHeight / 2))

        // Combined score that favors both visibility and centeredness
        const score = visibility * 0.7 + centerWeight * 0.3

        if (score > bestVisibility) {
          bestVisibility = score
          bestSection = section
        }
      })

      // Lower the threshold for section changes during scrolling
      // This makes the buttons more responsive to scrolling
      if (bestSection && bestSection.id !== activeId && bestVisibility > 0.15) {
        debugLog("Updating active section to:", bestSection.id, "with visibility:", bestVisibility)
        setActiveId(bestSection.id)
        scrollActiveButtonIntoView(bestSection.id)
      }
    }

    // Use requestAnimationFrame for smoother updates
    const handleScroll = () => {
      // Skip if user clicked a section recently
      if (shouldPrioritizeUserClick()) return

      // Cancel any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Schedule the update on the next animation frame
      animationFrameRef.current = requestAnimationFrame(() => {
        updateActiveSection()
        animationFrameRef.current = null
      })
    }

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true })
    const scrollContainer = document.querySelector(".scroll-container")
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    }

    // Initial update
    setTimeout(updateActiveSection, 100)
    setTimeout(updateActiveSection, 300)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current)
      }
    }
  }, [activeId, items])

  // Update the scrollToSection function to be more reliable on mobile
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    const scrollContainer = document.querySelector(".scroll-container") || document.documentElement

    if (section && scrollContainer) {
      // Set this as a user-clicked section
      userClickedSectionRef.current = sectionId
      userClickTimeRef.current = Date.now()

      debugLog("User clicked section:", sectionId)

      // Set active section immediately for better UX
      setActiveId(sectionId)
      scrollActiveButtonIntoView(sectionId)

      // Update URL without reload
      window.history.pushState(null, "", `#${sectionId}`)

      // Set scrolling state
      setIsScrolling(true)

      // Calculate the top position of the section
      const sectionTop = section.offsetTop

      // Use a more gentle scroll
      scrollContainer.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      })

      // Reset scrolling flag after animation completes
      setTimeout(() => {
        setIsScrolling(false)
      }, 800) // Reduced from 1000ms to 800ms

      // Clear any existing timeout
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current)
      }

      // Set a timeout to clear the user clicked section after 2 seconds
      // Reduced from 5 seconds to 2 seconds for better responsiveness
      lockTimeoutRef.current = setTimeout(() => {
        debugLog("Clearing user clicked section lock")
        userClickedSectionRef.current = null
      }, 2000)
    }
  }

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && items.some((item) => item.id === hash)) {
        // Set this as a user-clicked section
        userClickedSectionRef.current = hash
        userClickTimeRef.current = Date.now()

        debugLog("Hash changed to:", hash)

        // Update active ID
        setActiveId(hash)
        scrollActiveButtonIntoView(hash)

        // Clear any existing timeout
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current)
        }

        // Set a timeout to clear the user clicked section after 2 seconds
        lockTimeoutRef.current = setTimeout(() => {
          debugLog("Clearing user clicked section lock from hash change")
          userClickedSectionRef.current = null
        }, 2000)
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [items])

  return (
    <div
      ref={containerRef}
      className="flex justify-start gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
      role="navigation"
      aria-label="Mobile section navigation"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault()
            if (!isScrolling) {
              scrollToSection(item.id)

              // Provide haptic feedback if available
              if (navigator.vibrate) {
                navigator.vibrate(10)
              }
            }
          }}
          aria-label={`Jump to ${item.label} section`}
          aria-current={activeId === item.id ? "location" : undefined}
          ref={(el) => {
            buttonRefs.current[item.id] = el
          }}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium uppercase border transition-all duration-300 whitespace-nowrap",
            "focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)] focus:ring-offset-2",
            activeId === item.id
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)] shadow-sm"
              : "text-[var(--olivea-olive)] border-[var(--olivea-olive)]/70 hover:bg-[var(--olivea-olive)]/10 hover:border-[var(--olivea-olive)]",
          )}
          data-active={activeId === item.id ? "true" : "false"}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
