"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SECTION_EVENTS } from "@/lib/section-navigation"

interface DockItem {
  id: string
  label: string
  number: string
}

interface Props {
  items: DockItem[]
}

export default function DockLeft({ items = [] }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const initialRender = useRef(true)
  const debugModeRef = useRef(true)
  const checkVisibleSectionsRef = useRef<() => void>()

  // Debug logger
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[DockLeft]", ...args)
    }
  }

  // Filter out invalid items
  const validItems = items.filter((item) => item && typeof item === "object" && item.id && item.label && item.number)

  // Safety check for empty items array
  if (!validItems.length) {
    return null
  }

  // Function to check which section is currently in view
  const checkVisibleSections = useCallback(() => {
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

    // Update active section if found
    if (activeSection) {
      const sectionId = activeSection.id

      // Check if this section ID exists in our items
      const sectionExists = validItems.some((item) => item.id === sectionId)

      if (sectionExists && sectionId !== activeSection) {
        debugLog(`Setting active section: ${sectionId}`)
        setActiveSection(sectionId)
      }
    }
  }, [validItems])

  // Initialize activeSection with the first item if not set
  useEffect(() => {
    if (initialRender.current) {
      if (validItems.length > 0) {
        setActiveSection(validItems[0].id)
      }
      initialRender.current = false
    }
  }, [validItems])

  // Listen for section change events
  useEffect(() => {
    const handleSectionInView = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.id) {
        const sectionId = customEvent.detail.id

        // Check if this section ID exists in our items
        const sectionExists = validItems.some((item) => item.id === sectionId)

        if (sectionExists) {
          debugLog(`Section in view event received: ${sectionId}`)
          setActiveSection(sectionId)
        }
      }
    }

    // Listen to both event types
    document.addEventListener("sectionInView", handleSectionInView)
    document.addEventListener(SECTION_EVENTS.SECTION_IN_VIEW, handleSectionInView)

    // Add direct scroll listener
    const handleScroll = () => {
      // Throttle the check to avoid performance issues
      if (!document.body.dataset.scrollThrottle) {
        document.body.dataset.scrollThrottle = "true"
        setTimeout(() => {
          checkVisibleSections()
          delete document.body.dataset.scrollThrottle
        }, 100)
      }
    }

    // Listen to scroll events on the scroll container
    const scrollContainer = document.querySelector(".scroll-container")
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    }

    // Also listen to window scroll events
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Force initial check
    setTimeout(checkVisibleSections, 200)
    setTimeout(checkVisibleSections, 500)
    setTimeout(checkVisibleSections, 1000)

    return () => {
      document.removeEventListener("sectionInView", handleSectionInView)
      document.removeEventListener(SECTION_EVENTS.SECTION_IN_VIEW, handleSectionInView)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      window.removeEventListener("scroll", handleScroll)
    }
  }, [validItems, checkVisibleSections])

  return (
    <nav className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40" aria-label="Section navigation">
      <div className="flex flex-col gap-6">
        {validItems.map((item) => {
          const isHovered = hoveredId === item.id
          const isActive = activeSection === item.id
          const isAnimated = isActive || isHovered

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group relative flex items-center gap-4 transition-all duration-500 cursor-pointer",
                isActive ? "text-[var(--olivea-clay)]" : "text-[var(--olivea-olive)] opacity-80 hover:opacity-100",
              )}
              aria-current={isActive ? "location" : undefined}
              aria-label={`Navigate to ${item.label} section`}
              data-active={isActive ? "true" : "false"}
            >
              <div className="flex-shrink-0 w-10">
                <span className="text-2xl tabular-nums font-extrabold" aria-hidden="true">
                  {item.number}
                </span>
              </div>

              <div className="relative h-8 overflow-hidden min-w-[200px]">
                <div className="grid grid-cols-1 grid-rows-1">
                  <motion.div
                    className="col-start-1 row-start-1 text-2xl font-bold whitespace-nowrap"
                    animate={{
                      y: isAnimated ? -24 : 0,
                      filter: isAnimated ? "blur(0.6px)" : "blur(0px)",
                    }}
                    transition={{
                      y: { type: "spring", stiffness: isHovered ? 200 : 400, damping: 20 },
                      filter: { duration: 0.3 },
                    }}
                    aria-hidden="true"
                  >
                    {item.label.toUpperCase()}
                  </motion.div>
                  <motion.div
                    className="col-start-1 row-start-1 text-2xl font-bold whitespace-nowrap"
                    initial={{ y: 24, filter: "blur(0.6px)" }}
                    animate={{
                      y: isAnimated ? 0 : 24,
                      filter: isAnimated ? "blur(0px)" : "blur(0.6px)",
                    }}
                    transition={{
                      y: { type: "spring", stiffness: isHovered ? 200 : 400, damping: 20 },
                      filter: { duration: 0.3 },
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
