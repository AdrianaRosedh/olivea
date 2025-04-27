"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface MobileSectionNavItem {
  id: string
  label: string
}

interface Props {
  items: MobileSectionNavItem[]
}

export default function MobileSectionNav({ items }: Props) {
  const pathname = usePathname()
  // Don't set initial state to avoid hydration mismatch
  const [activeId, setActiveId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const isClientRef = useRef(false)

  // Function to scroll active button into view
  const scrollActiveButtonIntoView = (id: string) => {
    if (!containerRef.current || !buttonRefs.current[id]) return

    const container = containerRef.current
    const button = buttonRefs.current[id]

    // Calculate the center position
    const containerWidth = container.offsetWidth
    const buttonWidth = button.offsetWidth
    const buttonLeft = button.offsetLeft

    // Calculate scroll position to center the button
    const scrollPosition = buttonLeft - containerWidth / 2 + buttonWidth / 2

    // Scroll the container
    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: "smooth",
    })
  }

  // Safe initialization after hydration
  useEffect(() => {
    // Mark that we're on the client
    isClientRef.current = true

    // Set initial active ID only on client
    if (activeId === null && items.length > 0) {
      const initialId = items[0].id
      setActiveId(initialId)

      // Small delay to ensure refs are set
      setTimeout(() => {
        scrollActiveButtonIntoView(initialId)
      }, 100)
    }

    // Listen for custom section visibility events
    const handleSectionInView = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.id) {
        const newActiveId = customEvent.detail.id
        setActiveId(newActiveId)
        scrollActiveButtonIntoView(newActiveId)
      }
    }

    document.addEventListener("sectionInView", handleSectionInView)

    return () => {
      document.removeEventListener("sectionInView", handleSectionInView)
    }
  }, [items, activeId, pathname]) // Re-initialize on path change

  // Effect to ensure active button is visible when activeId changes
  useEffect(() => {
    if (activeId && isClientRef.current) {
      scrollActiveButtonIntoView(activeId)
    }
  }, [activeId])

  // Handle click to scroll to section
  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()

    // Find the section element
    const section = document.getElementById(id)

    if (section) {
      // Get the parent scroll container
      const scrollContainer = section.closest(".scroll-container") || document.documentElement

      // Scroll the container
      scrollContainer.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      })

      // Update active state
      setActiveId(id)
      scrollActiveButtonIntoView(id)

      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-start gap-3 px-4 py-2 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar"
      role="navigation"
      aria-label="Mobile section navigation"
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
          data-active={activeId === item.id ? "true" : "false"} // Add data attribute for debugging
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
