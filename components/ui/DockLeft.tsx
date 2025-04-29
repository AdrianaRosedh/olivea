"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
  const scrollingRef = useRef(false)
  const lastActiveIdRef = useRef<string | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

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

      if (bestSection && bestSection.id !== activeId) {
        // Update the active ID
        setActiveId(bestSection.id)
        lastActiveIdRef.current = bestSection.id
      }
    }

    // Force a scroll event to activate listeners
    const forceScrollEvent = () => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      window.dispatchEvent(new Event("scroll"))
    }

    // Use requestAnimationFrame for smoother animations tied to scroll
    const handleScroll = () => {
      // Skip if we're programmatically scrolling
      if (scrollingRef.current) return

      // Cancel any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Use requestAnimationFrame for smoother updates
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
    updateActiveSection()

    // Force multiple updates to ensure it works
    const timers = [
      setTimeout(() => {
        updateActiveSection()
        forceScrollEvent()
      }, 100),
      setTimeout(() => {
        updateActiveSection()
        forceScrollEvent()
      }, 300),
      setTimeout(() => {
        updateActiveSection()
        forceScrollEvent()
      }, 600),
      setTimeout(() => {
        updateActiveSection()
        forceScrollEvent()
      }, 1000),
    ]

    // Listen for navigation events
    const handleNavigationComplete = () => {
      console.log("[DockLeft] Navigation complete, reinitializing")
      // Force multiple updates after navigation
      setTimeout(() => {
        updateActiveSection()
        forceScrollEvent()
      }, 100)
      setTimeout(() => {
        updateActiveSection()
        forceScrollEvent()
      }, 300)
    }

    document.addEventListener("navigation:complete", handleNavigationComplete)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      timers.forEach(clearTimeout)
      document.removeEventListener("navigation:complete", handleNavigationComplete)
    }
  }, [activeId, items])

  // Function to scroll to a section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    const scrollContainer = document.querySelector(".scroll-container") || document.documentElement

    if (section && scrollContainer) {
      // Mark that we're programmatically scrolling
      scrollingRef.current = true
      setIsAnimating(true)

      // Update URL without reload
      window.history.pushState(null, "", `#${sectionId}`)

      // Set active section immediately for better UX
      setActiveId(sectionId)
      lastActiveIdRef.current = sectionId

      // Calculate the top position of the section
      const sectionTop = section.offsetTop

      // Use a more gentle scroll
      scrollContainer.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      })

      // Reset scrolling flag after animation completes
      setTimeout(() => {
        scrollingRef.current = false
        setIsAnimating(false)
      }, 1000)
    }
  }

  return (
    <nav className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40" aria-label="Section navigation">
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isHovered = hoveredId === item.id
          const isActive = activeId === item.id
          const isAnimated = isActive || isHovered

          // More balanced animation settings for hover
          const hoverAnimationSettings = {
            y: { type: "spring", stiffness: 200, damping: 20, duration: 0.4 },
            filter: { duration: 0.3 },
          }

          // Faster animation settings for scroll/active state changes
          const activeAnimationSettings = {
            y: { type: "spring", stiffness: 400, damping: 20 },
            filter: { duration: 0.2 },
          }

          // Use hover settings when hovering, active settings when changing due to scroll
          const animationSettings = isHovered && !isActive ? hoverAnimationSettings : activeAnimationSettings

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                if (!isAnimating) {
                  scrollToSection(item.id)
                }
              }}
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
                    transition={animationSettings}
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
                    transition={animationSettings}
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
