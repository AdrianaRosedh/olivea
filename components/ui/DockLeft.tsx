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
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const mountedRef = useRef(false)
  const pathname = usePathname() // Track pathname for navigation changes

  // Initialize scroll container and event listeners
  const initializeScrollFunctionality = useCallback(() => {
    console.log("[DockLeft] Initializing scroll functionality")

    // Find the scroll container
    scrollContainerRef.current = document.querySelector(".scroll-container") || document.documentElement

    // Set initial active section
    if (items.length > 0) {
      setActiveId(items[0].id)

      // Force an initial check
      setTimeout(() => {
        const firstSection = document.getElementById(items[0]?.id || "")
        if (firstSection) {
          document.dispatchEvent(
            new CustomEvent("sectionInView", {
              detail: {
                id: items[0].id,
                intersectionRatio: 1.0,
              },
            }),
          )
        }
      }, 200)
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
      if (customEvent.detail?.id) {
        setActiveId(customEvent.detail.id)
      }
    }

    document.addEventListener("sectionInView", handleSectionInView)

    // Listen for navigation events
    const handleNavigationComplete = () => {
      console.log("[DockLeft] Navigation complete, reinitializing")
      // Re-initialize after navigation
      setTimeout(initializeScrollFunctionality, 100)
    }

    document.addEventListener("navigation:complete", handleNavigationComplete)

    // Also listen for scroll initialization events
    const handleScrollInit = () => {
      console.log("[DockLeft] Scroll initialize event received")
      initializeScrollFunctionality()
    }

    document.addEventListener("scroll:initialize", handleScrollInit)

    return () => {
      document.removeEventListener("sectionInView", handleSectionInView)
      document.removeEventListener("navigation:complete", handleNavigationComplete)
      document.removeEventListener("scroll:initialize", handleScrollInit)
    }
  }, [items, pathname, initializeScrollFunctionality])

  // Improved scroll function with useCallback for better performance
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()

    // Re-query the DOM to ensure we have the latest references
    const el = document.getElementById(id)
    const scrollContainer = document.querySelector(".scroll-container") || document.documentElement

    console.log(`[DockLeft] Click handler for ${id}, element:`, el, "container:", scrollContainer)

    if (el && scrollContainer) {
      // Calculate the top position of the section relative to the scroll container
      const sectionTop = el.offsetTop

      console.log(`[DockLeft] Scrolling to section ${id} at position ${sectionTop}`)

      // Scroll the container
      scrollContainer.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      })

      // Provide haptic feedback if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10)
      }

      // Update URL without reload
      window.history.pushState(null, "", `#${id}`)

      // Update active state immediately for better UX
      setActiveId(id)

      // Also dispatch the event to ensure other components update
      document.dispatchEvent(
        new CustomEvent("sectionInView", {
          detail: {
            id,
            intersectionRatio: 1.0,
          },
        }),
      )
    } else {
      console.warn(`[DockLeft] Could not find section ${id} or scroll container`)
    }
  }, [])

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
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "group relative flex items-center space-x-4 transition-all duration-500 cursor-pointer",
              isActive ? "text-[var(--olivea-clay)]" : "text-[var(--olivea-olive)] opacity-80 hover:opacity-100",
            )}
            aria-current={isActive ? "location" : undefined}
            aria-label={`Navigate to ${item.label} section`}
            data-active={isActive ? "true" : "false"} // Add data attribute for debugging
          >
            <span className="text-2xl tabular-nums font-extrabold" aria-hidden="true">
              {item.number}
            </span>

            {/* Text reveal container */}
            <div className="relative h-8 overflow-hidden">
              <div className="relative">
                {/* Top text that slides up and out */}
                <motion.div
                  className="block text-2xl font-bold"
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
                  className="block text-2xl font-bold absolute top-0 left-0"
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
