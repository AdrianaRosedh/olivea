"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useSectionObserver } from "@/hooks/useSectionObserver"

interface MobileSectionNavItem {
  id: string
  label: string
}

interface Props {
  items: MobileSectionNavItem[]
}

export default function MobileSectionNav({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id || null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const hasInteracted = useRef(false)

  useSectionObserver((id) => {
    setActiveId(id)
    if (!hasInteracted.current) {
      hasInteracted.current = true
    }
  })

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
      window.history.pushState(null, "", `#${sectionId}`)

      if (navigator.vibrate) {
        navigator.vibrate(10)
      }

      hasInteracted.current = true
    }
  }

  useEffect(() => {
    if (!activeId) return

    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768
    if (!isMobile) return

    if (!hasInteracted.current) return // ❌ Skip initial load!

    const container = containerRef.current
    const button = buttonRefs.current[activeId]

    if (container && button) {
      const containerWidth = container.offsetWidth
      const buttonLeft = button.offsetLeft
      const buttonWidth = button.offsetWidth

      const targetScrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2

      let start: number | null = null
      const initialScroll = container.scrollLeft
      const distance = targetScrollLeft - initialScroll
      const duration = 400

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

      const animate = (timestamp: number) => {
        if (start === null) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutCubic(progress)

        container.scrollLeft = initialScroll + distance * easedProgress

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)

      // Vibrate slightly when user interacted and section changed
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }, [activeId])

  return (
    <div
      ref={containerRef}
      className="flex justify-start gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap no-scrollbar bg-transparent border-none shadow-none"
      role="navigation"
      aria-label="Mobile section navigation"
    >
      {items.map((item) => (
        <a
          key={item.id}
          ref={(el) => {
            buttonRefs.current[item.id] = el
          }}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection(item.id)
          }}
          aria-label={`Jump to ${item.label} section`}
          aria-current={activeId === item.id ? "location" : undefined}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium uppercase border transition-all duration-300 whitespace-nowrap",
            "focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)] focus:ring-offset-2",
            activeId === item.id
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
              : "text-[var(--olivea-olive)] border-[var(--olivea-olive)]/70 hover:bg-[var(--olivea-olive)]/10 hover:border-[var(--olivea-olive)]",
          )}
          data-active={activeId === item.id ? "true" : "false"}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}