"use client"

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
  const [activeSection, setActiveSection] = useState(items[0]?.id || "")
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const pathname = usePathname()

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveSection(sectionId)
      window.history.pushState(null, "", `#${sectionId}`)
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }

  const checkVisibleSections = () => {
    const sections = Array.from(document.querySelectorAll("section[id]"))
    const threshold = window.innerHeight / 2

    let mostVisibleSection = activeSection
    let closestDistance = Infinity

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const distance = Math.abs(rect.top)

      if (distance < closestDistance && rect.top < threshold && rect.bottom > threshold / 2) {
        closestDistance = distance
        mostVisibleSection = section.id
      }
    })

    if (mostVisibleSection !== activeSection) {
      setActiveSection(mostVisibleSection)
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", checkVisibleSections, { passive: true })
    window.addEventListener("resize", checkVisibleSections)
    
    setTimeout(checkVisibleSections, 100) // Initial check

    return () => {
      window.removeEventListener("scroll", checkVisibleSections)
      window.removeEventListener("resize", checkVisibleSections)
    }
  }, [activeSection, pathname])

  useEffect(() => {
    const container = containerRef.current
    const button = buttonRefs.current[activeSection]

    if (container && button) {
      const containerRect = container.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()

      const offset =
        buttonRect.left -
        containerRect.left -
        containerRect.width / 2 +
        buttonRect.width / 2

      container.scrollBy({ left: offset, behavior: "smooth" })
    }
  }, [activeSection])

  return (
    <nav
      ref={containerRef}
      className="flex gap-3 px-4 py-2 overflow-x-auto no-scrollbar bg-transparent"
      aria-label="Mobile section navigation"
    >
      {items.map((item) => (
        <a
          key={item.id}
          ref={el => { buttonRefs.current[item.id] = el }}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection(item.id)
          }}
          aria-current={activeSection === item.id ? "location" : undefined}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium uppercase border transition-all duration-300",
            activeSection === item.id
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
              : "text-[var(--olivea-olive)] border-[var(--olivea-olive)]/70 hover:bg-[var(--olivea-olive)]/10",
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}