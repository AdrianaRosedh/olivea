"use client"

import { useState, useEffect, useRef } from "react"
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

export default function DockLeft({ items = [] }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const initialRender = useRef(true)

  // Filter out invalid items
  const validItems = items.filter((item) => item && typeof item === "object" && item.id && item.label && item.number)

  // Safety check for empty items array
  if (!validItems.length) {
    return null
  }

  // Initialize activeSection with the first item if not set
  useEffect(() => {
    if (initialRender.current) {
      if (!activeSection && validItems.length > 0) {
        setActiveSection(validItems[0].id)
      }
      initialRender.current = false
    }
  }, [validItems, activeSection])

  // Listen for section change events
  useEffect(() => {
    const handleSectionInView = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.id) {
        setActiveSection(customEvent.detail.id)
      }
    }

    document.addEventListener("sectionInView", handleSectionInView)
    return () => document.removeEventListener("sectionInView", handleSectionInView)
  }, [])

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
