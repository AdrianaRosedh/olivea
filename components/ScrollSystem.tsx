"use client"

import type React from "react"

import { useEffect, useRef, useState, createContext, useContext } from "react"
import { usePathname } from "next/navigation"

// Create a context to share scroll state across components
type ScrollContextType = {
  activeSection: string | null
  scrollProgress: number
  scrollTo: (sectionId: string) => void
  isScrolling: boolean
}

const ScrollContext = createContext<ScrollContextType>({
  activeSection: null,
  scrollProgress: 0,
  scrollTo: () => {},
  isScrolling: false,
})

// Hook to use the scroll context
export const useScroll = () => useContext(ScrollContext)

export default function ScrollSystem({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const pathname = usePathname()

  // Refs to track state without triggering re-renders
  const scrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  // Initialize on mount and when pathname changes
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    console.log("[ScrollSystem] Initializing")

    // Find the scroll container
    scrollContainerRef.current = document.querySelector(".scroll-container") || document.documentElement

    // Function to update scroll progress
    const updateScrollProgress = () => {
      if (!scrollContainerRef.current) return

      const container = scrollContainerRef.current
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      // Calculate progress (0 to 1)
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll))

      setScrollProgress(progress)
    }

    // Function to determine which section is active
    const updateActiveSection = () => {
      // Skip if we're programmatically scrolling
      if (scrollingRef.current) return

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

      if (bestSection && bestSection.id !== activeSection) {
        setActiveSection(bestSection.id)
      }
    }

    // Throttled scroll handler
    const handleScroll = () => {
      // Skip if we're programmatically scrolling
      if (scrollingRef.current) return

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Update scroll progress immediately
      updateScrollProgress()

      // Throttle section updates
      scrollTimeoutRef.current = setTimeout(() => {
        updateActiveSection()
        scrollTimeoutRef.current = null
      }, 50)
    }

    // Add scroll listener
    const scrollContainer = scrollContainerRef.current
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true })

    // Initial update
    updateScrollProgress()
    updateActiveSection()

    // Force multiple updates to ensure it works
    const timers = [
      setTimeout(() => {
        updateScrollProgress()
        updateActiveSection()
      }, 100),
      setTimeout(() => {
        updateScrollProgress()
        updateActiveSection()
      }, 500),
    ]

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      timers.forEach(clearTimeout)
    }
  }, [pathname, activeSection])

  // Function to scroll to a section
  const scrollTo = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    const container = scrollContainerRef.current

    if (section && container) {
      // Mark that we're programmatically scrolling
      scrollingRef.current = true
      setIsScrolling(true)

      // Update URL without reload
      window.history.pushState(null, "", `#${sectionId}`)

      // Set active section immediately for better UX
      setActiveSection(sectionId)

      // Calculate the top position of the section
      const sectionTop = section.offsetTop

      // Scroll to the section
      container.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      })

      // Reset scrolling flag after animation completes
      setTimeout(() => {
        scrollingRef.current = false
        setIsScrolling(false)
      }, 1000) // Adjust timeout to match scroll duration
    }
  }

  // Context value
  const contextValue = {
    activeSection,
    scrollProgress,
    scrollTo,
    isScrolling,
  }

  return <ScrollContext.Provider value={contextValue}>{children}</ScrollContext.Provider>
}
