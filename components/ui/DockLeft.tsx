"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // Find the scroll container on mount
  useEffect(() => {
    scrollContainerRef.current = document.querySelector(".scroll-container")
  }, [])

  // Use Intersection Observer API for better performance
  useEffect(() => {
    if (typeof window === "undefined") return

    // Create observers for each section
    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: "-10% 0px -40% 0px", // Adjust these values for better detection
      threshold: [0.1, 0.5, 0.9],
    }

    // Create a single observer for all sections
    const observer = new IntersectionObserver((entries) => {
      // Find the most visible section
      let maxVisibility = 0
      let mostVisibleId: string | null = null

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          const visibility = entry.intersectionRatio

          if (visibility > maxVisibility) {
            maxVisibility = visibility
            mostVisibleId = id
          }
        }
      })

      if (mostVisibleId) {
        setActiveId(mostVisibleId)
      }
    }, observerOptions)

    // Observe all sections
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  // Improved scroll function with useCallback for better performance
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    const scrollContainer = scrollContainerRef.current

    if (el && scrollContainer) {
      // Use the new View Transitions API if available
      if ("startViewTransition" in document && typeof (document as any).startViewTransition === "function") {
        ;(document as any).startViewTransition(() => {
          // Calculate the top position of the section relative to the scroll container
          const sectionTop = el.offsetTop

          // Scroll the container
          scrollContainer.scrollTo({
            top: sectionTop,
            behavior: "smooth",
          })
        })
      } else {
        // Fallback for browsers without View Transitions API
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }

      // Provide haptic feedback if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10)
      }

      // Update URL without reload
      window.history.pushState(null, "", `#${id}`)

      // Update active state
      setActiveId(id)
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
