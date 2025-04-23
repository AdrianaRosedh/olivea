"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface DockItem {
  id: string
  icon: React.ReactNode
  label: string
}

interface Props {
  items: DockItem[]
  scrollProgress?: number // ✅ ADDED to fix TypeScript error
}

export default function DockLeft({ items, scrollProgress }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { threshold: 0.6 }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <div className="relative hidden md:flex flex-col gap-4 items-start">
      {/* Optional: Visual debug for scrollProgress */}
      {/* <div className="text-xs text-gray-400 mb-2">
        Scroll: {Math.round((scrollProgress ?? 0) * 100)}%
      </div> */}

      {items.map((item) => {
        const isActive = activeId === item.id

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "group relative flex items-center pl-1 pr-3 py-1 rounded-full border transition-all duration-300 overflow-hidden",
              isActive
                ? "bg-[var(--olivea-soil)] text-white border-[var(--olivea-soil)]"
                : "text-[var(--olivea-soil)] border-[var(--olivea-soil)] hover:bg-[var(--olivea-soil)] hover:text-white"
            )}
          >
            <span className="w-10 h-10 flex items-center justify-center">
              {item.icon}
            </span>

            <span
              className={cn(
                "ml-2 max-w-0 opacity-0 translate-x-[-8px] group-hover:max-w-xs group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-in-out overflow-hidden text-sm font-medium whitespace-nowrap",
                isActive && "max-w-xs opacity-100 translate-x-0"
              )}
            >
              {item.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}