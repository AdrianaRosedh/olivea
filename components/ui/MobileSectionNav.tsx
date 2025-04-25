"use client"

import type React from "react"

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
      },
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  // Handle click to scroll to section
  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()

    // Find the section element
    const section = document.getElementById(id)

    if (section) {
      // Get the parent scroll container
      const scrollContainer = section.closest(".scroll-container")

      // Firefox-compatible approach
      if (scrollContainer) {
        // Calculate the top position of the section relative to the scroll container
        const sectionTop = section.offsetTop

        // Scroll the container
        scrollContainer.scrollTo({
          top: sectionTop,
          behavior: "smooth",
        })
      } else {
        // Fallback to standard scrollIntoView
        section.scrollIntoView({ behavior: "smooth", block: "start" })
      }

      // Update active state
      setActiveId(id)

      // Provide haptic feedback if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10)
      }
    }
  }

  return (
    <nav
      ref={containerRef}
      className="flex gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
      aria-label="Mobile section navigation"
      role="navigation"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => handleSectionClick(e, item.id)}
          aria-label={`Jump to ${item.label} section`}
          aria-current={activeId === item.id ? "location" : undefined}
          ref={(el) => {
            buttonRefs.current[item.id] = el
          }}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium uppercase border transition-all duration-300 whitespace-nowrap",
            "focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)] focus:ring-offset-2",
            activeId === item.id
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)] shadow-sm"
              : "text-[var(--olivea-olive)] border-[var(--olivea-olive)]/70 hover:bg-[var(--olivea-olive)]/10 hover:border-[var(--olivea-olive)]",
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
