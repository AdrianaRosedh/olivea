"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type DockItem = {
  id: string
  icon: React.ReactNode
  label: string
}

interface DockLeftProps {
  items: DockItem[]
}

export default function DockLeft({ items }: DockLeftProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Track active section with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-40% 0% -40% 0%" } // triggers around the middle of the screen
    )

    items.forEach((item) => {
      const section = document.getElementById(item.id)
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [items])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="scroll-container flex flex-col items-center gap-3">
      {items.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "scroll-container w-10 h-10 rounded-full flex items-center justify-center border transition-all",
            activeId === item.id
              ? "bg-[var(--olivea-soil)] text-white border-[var(--olivea-soil)]"
              : "bg-white text-[var(--olivea-soil)] border-[var(--olivea-soil)]"
          )}
          aria-label={item.label}
        >
          {item.icon}
        </motion.button>
      ))}
    </div>
  )
}