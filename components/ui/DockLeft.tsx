"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSectionObserver } from "@/hooks/useSectionObserver"

interface DockItem {
  id: string
  label: string
  number: string
}

interface Props {
  items: DockItem[]
}

export default function DockLeft({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id || null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useSectionObserver(setActiveId)

  const scrollToSection = (sectionId: string) => {
    // ✅ Fixed event detail key
    document.dispatchEvent(
      new CustomEvent("scroll-to-section", {
        detail: { sectionId },
      })
    )

    // Force re-evaluation by observers after scroll
    setTimeout(() => {
      window.dispatchEvent(new Event("scroll"))
    }, 600)
  }

  return (
    <nav
      className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40"
      aria-label="Section navigation"
    >
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isHovered = hoveredId === item.id
          const isActive = activeId === item.id
          const isAnimated = isActive || isHovered

          const animationSettings = {
            y: { type: "spring", stiffness: isHovered ? 200 : 400, damping: 20 },
            filter: { duration: 0.3 },
          }

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(item.id)
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group relative flex items-center gap-4 transition-all duration-500 cursor-pointer",
                isActive ? "text-[var(--olivea-clay)]" : "text-[var(--olivea-olive)] opacity-80 hover:opacity-100"
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
                    transition={animationSettings}
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