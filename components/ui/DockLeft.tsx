"use client"

import type React from "react"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleScroll = () => {
      // Simple scroll position detection
      const scrollPosition = window.scrollY + window.innerHeight / 2

      // Find the section that's currently in view
      for (const item of items) {
        const element = document.getElementById(item.id)
        if (!element) continue

        const { top, bottom } = element.getBoundingClientRect()
        const elementCenter = top + (bottom - top) / 2

        if (elementCenter > 0 && elementCenter < window.innerHeight) {
          setActiveId(item.id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [items])

  // Implement the scrollIntoView with block: "center" as suggested
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })

      // Provide haptic feedback if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10)
      }

      // Update active state
      setActiveId(id)
    }
  }

  return (
    <div className="hidden md:flex flex-col gap-6 items-start text-xl font-bold tracking-widest uppercase">
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
          >
            <span className="text-2xl tabular-nums font-extrabold">{item.number}</span>

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
                >
                  {item.label.toUpperCase()}
                </motion.div>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}
