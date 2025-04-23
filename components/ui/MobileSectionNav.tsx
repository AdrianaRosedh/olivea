"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileSectionNavItem {
  id: string
  label: string
}

interface Props {
  items: MobileSectionNavItem[]
}

export default function MobileSectionNav({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const lastVibratedRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  // IntersectionObserver to track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setActiveId(id)

            // Vibrate only once per new section
            if (id !== lastVibratedRef.current && "vibrate" in navigator) {
              navigator.vibrate(10)
              lastVibratedRef.current = id
            }

            // Auto-scroll nav button into view
            const btn = buttonRefs.current[id]
            if (btn && containerRef.current) {
              const offsetLeft = btn.offsetLeft
              containerRef.current.scrollTo({
                left: offsetLeft - 16,
                behavior: "smooth",
              })
            }

            break
          }
        }
      },
      {
        root: null,
        threshold: 0.6,
      }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item.id)}
          ref={(el: HTMLButtonElement | null): void => {
            buttonRefs.current[item.id] = el
          }}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap",
            activeId === item.id
              ? "bg-[var(--olivea-soil)] text-white border-[var(--olivea-soil)]"
              : "text-[var(--olivea-soil)] border-[var(--olivea-soil)] hover:bg-[var(--olivea-soil)] hover:text-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}