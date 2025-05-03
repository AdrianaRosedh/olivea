// app/[lang]/casa/CasaClientPage.tsx
"use client"

import { useEffect, useRef } from "react"
import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker"

export type SectionDict = {
  title:       string
  description: string
  error?:      string
}

export interface RoomItem {
  id:        number
  name:      string
  price:     number
  available: boolean
  category?: string
}

interface CasaClientPageProps {
  dict:            SectionDict
  itemsByCategory: Record<string, RoomItem[]>
}

export default function CasaClientPage({
  dict,
  itemsByCategory,
}: CasaClientPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionIds  = ["about", ...Object.keys(itemsByCategory)]

  // Smooth-scroll in-page hash links
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      e.preventDefault()
      const id = a.getAttribute("href")!.slice(1)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  // Fire a few micro-scrolls so the tracker highlights the first section
  useEffect(() => {
    const bump = () => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      document.dispatchEvent(new Event("scroll"))
    }
    const timers = [100, 300, 600].map((t) => setTimeout(bump, t))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="scroll-container min-h-screen overflow-y-auto snap-y snap-mandatory"
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* ABOUT */}
        <section
          id="about"
          data-section-id="about"
          className="min-h-screen snap-center flex items-center justify-center px-6"
          aria-labelledby="about-heading"
        >
          <div className="max-w-2xl text-center">
            <TypographyH2 id="about-heading">{dict.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.description}</TypographyP>
          </div>
        </section>

        {/* ROOM CATEGORIES */}
        {Object.entries(itemsByCategory).map(([category, rooms]) => (
          <section
            key={category}
            id={category}
            data-section-id={category}
            className="min-h-screen snap-center flex items-center justify-center px-6"
            aria-labelledby={`${category}-heading`}
          >
            <div className="max-w-2xl text-center">
              <TypographyH2 id={`${category}-heading`}>{category}</TypographyH2>
              <div className="mt-4 space-y-3 text-left">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between border-b py-2"
                  >
                    <span>{room.name}</span>
                    <span>${room.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  )
}