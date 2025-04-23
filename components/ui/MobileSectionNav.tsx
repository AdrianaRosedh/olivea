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
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setActiveId((prev) => {
              if (prev !== id && window.navigator.vibrate) {
                window.navigator.vibrate(10)
              }
              return id
            })

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
        threshold: 0.5,
      }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <div
      ref={containerRef}
      className="flex gap-3 px-4 py-3 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
      aria-label="Mobile section navigation"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-label={`Jump to ${item.label}`}
          ref={(el) => {
            buttonRefs.current[item.id] = el
          }}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium uppercase border transition whitespace-nowrap",
            activeId === item.id
              ? "bg-[var(--olivea-soil)] text-white border-[var(--olivea-soil)]"
              : "text-[var(--olivea-soil)] border-[var(--olivea-soil)] hover:bg-[var(--olivea-soil)] hover:text-white"
          )}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}