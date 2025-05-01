"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [activeSection, setActiveSection] = useState(items[0]?.id || "")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const updateActiveSection = useCallback(() => {
    const sections = document.querySelectorAll("section[id]")
    let currentActive = activeSection

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        currentActive = section.id
      }
    })

    if (currentActive !== activeSection) setActiveSection(currentActive)
  }, [activeSection])

  useEffect(() => {
    window.addEventListener("scroll", updateActiveSection, { passive: true })
    updateActiveSection() // initial check
    return () => window.removeEventListener("scroll", updateActiveSection)
  }, [updateActiveSection])

  return (
    <nav className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isHovered = hoveredId === item.id
          const isActive = activeSection === item.id
          const showAnimated = isHovered || isActive

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group flex items-center gap-4 cursor-pointer overflow-hidden",
                isActive ? "text-[var(--olivea-clay)]" : "text-[var(--olivea-olive)] opacity-80 hover:opacity-100"
              )}
              aria-current={isActive ? "location" : undefined}
            >
              <span className="text-2xl tabular-nums font-extrabold w-10">
                {item.number}
              </span>

              <div className="relative h-8 overflow-hidden min-w-[200px]">
                <AnimatePresence initial={false}>
                  {showAnimated ? (
                    <motion.div
                      key="active"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 250, damping: 30 }}
                      className="absolute inset-0 flex items-center text-2xl font-bold whitespace-nowrap"
                    >
                      {item.label.toUpperCase()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inactive"
                      initial={{ y: "-100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 250, damping: 30 }}
                      className="absolute inset-0 flex items-center text-2xl font-bold whitespace-nowrap"
                    >
                      {item.label.toUpperCase()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </a>
          )
        })}
      </div>
    </nav>
  )
}