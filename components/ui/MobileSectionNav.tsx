"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { EVENTS } from "@/lib/navigation-events"
import { SECTION_EVENTS } from "@/lib/section-navigation"

interface MobileSectionNavItem {
  id: string
  label: string
}

interface Props {
  items: MobileSectionNavItem[]
}

export default function MobileSectionNav({ items }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(items[0]?.id || null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const hasInteracted = useRef(false)
  const isInitializedRef = useRef(false)
  const pathname = usePathname()
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const validItemIds = useRef<Set<string>>(new Set(items.map((item) => item.id)))

  // Function to scroll to a section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const container = document.querySelector(".scroll-container") as HTMLElement
      if (container) {
        container.scrollTo({ top: section.offsetTop, behavior: "smooth" })
      }

      // Update URL hash without scrolling
      window.history.pushState(null, "", `#${sectionId}`)

      // Update active section
      setActiveSection(sectionId)
      hasInteracted.current = true

      // Provide haptic feedback on mobile
      if (navigator.vibrate) navigator.vibrate(10)

      console.log(`[MobileSectionNav] Scrolled to section: ${sectionId}`)
    }
  }

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

      if (visibility > maxVisibility && validItemIds.current.has(section.id)) {
        maxVisibility = visibility
        activeSection = section
      }
    })

    // Update active section if found and we haven't just interacted
    if (activeSection && !hasInteracted.current) {
      console.log(`[MobileSectionNav] Section in view from scroll: ${activeSection.id}`)
      setActiveSection(activeSection.id)
    }
  }

  // Direct scroll handler
  const handleScroll = () => {
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set a new timeout to check sections after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      // Reset interaction flag after some time
      hasInteracted.current = false

      // Check which section is in view
      checkVisibleSections()
    }, 100)
  }

  // Initialize component
  const initializeComponent = () => {
    console.log("[MobileSectionNav] Initializing component")
    isInitializedRef.current = true
    hasInteracted.current = false
    validItemIds.current = new Set(items.map((item) => item.id))

    // Set initial active section
    if (items.length > 0) {
      setActiveSection(items[0].id)
    }

    // Check visible sections after a short delay
    setTimeout(checkVisibleSections, 100)
    setTimeout(checkVisibleSections, 500)
    setTimeout(checkVisibleSections, 1000)
  }

  // Listen for section change events and scroll events
  useEffect(() => {
    const handleSectionInView = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.id && validItemIds.current.has(customEvent.detail.id)) {
        console.log(`[MobileSectionNav] Section in view event: ${customEvent.detail.id}`)
        setActiveSection(customEvent.detail.id)
      }
    }

    document.addEventListener("sectionInView", handleSectionInView)
    document.addEventListener(SECTION_EVENTS.SECTION_IN_VIEW, handleSectionInView)

    // Add direct scroll listeners
    const scrollContainer = document.querySelector(".scroll-container") as HTMLElement
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Listen for navigation events
    const handleNavigationComplete = () => {
      console.log("[MobileSectionNav] Navigation complete, reinitializing")
      setTimeout(initializeComponent, 100)
    }

    document.addEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)

    // Listen for scroll initialization events
    const handleScrollInit = () => {
      console.log("[MobileSectionNav] Scroll initialize event received")
      setTimeout(checkVisibleSections, 100)
    }

    document.addEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)

    // Initialize on mount
    initializeComponent()

    // Cleanup
    return () => {
      document.removeEventListener("sectionInView", handleSectionInView)
      document.removeEventListener(SECTION_EVENTS.SECTION_IN_VIEW, handleSectionInView)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener(EVENTS.NAVIGATION_COMPLETE, handleNavigationComplete)
      document.removeEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollInit)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [items])

  // Re-initialize when pathname changes
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("[MobileSectionNav] Pathname changed, reinitializing")
      setTimeout(initializeComponent, 100)
    }
  }, [pathname])

  // Scroll active button into view
  useEffect(() => {
    if (!activeSection) return

    const container = containerRef.current
    const button = buttonRefs.current[activeSection]
    if (!container || !button) return

    const containerWidth = container.offsetWidth
    const buttonLeft = button.offsetLeft
    const buttonWidth = button.offsetWidth
    const targetScrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2

    const initialScroll = container.scrollLeft
    const distance = targetScrollLeft - initialScroll
    const duration = 400
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    let start: number | null = null
    const animate = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      container.scrollLeft = initialScroll + distance * easeOutCubic(progress)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [activeSection])

  return (
    <div
      ref={containerRef}
      className="flex justify-start gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap no-scrollbar bg-transparent border-none shadow-none"
      role="navigation"
      aria-label="Mobile section navigation"
    >
      {items.map((item) => (
        <a
          key={item.id}
          ref={(el) => {
            buttonRefs.current[item.id] = el
          }}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection(item.id)
          }}
          aria-label={`Jump to ${item.label} section`}
          aria-current={activeSection === item.id ? "location" : undefined}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium uppercase border transition-all duration-300 whitespace-nowrap",
            "focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)] focus:ring-offset-2",
            activeSection === item.id
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
              : "text-[var(--olivea-olive)] border-[var(--olivea-olive)]/70 hover:bg-[var(--olivea-olive)]/10 hover:border-[var(--olivea-olive)]",
          )}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
