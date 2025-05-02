// app/[lang]/cafe/CafeClientPage.tsx
"use client"

import { useEffect, useRef } from "react"
import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import MobileSectionTracker from "@/components/MobileSectionTracker"

export type SectionDict = {
  title:       string
  description: string
  error?:      string
}

export interface MenuItem {
  id:        number
  name:      string
  price:     number
  available: boolean
  category?: string
}

interface CafeClientPageProps {
  lang:            string
  dict:            SectionDict
  itemsByCategory: Record<string, MenuItem[]>
}

export default function CafeClientPage({
  lang,
  dict,
  itemsByCategory,
}: CafeClientPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionIds = ["about", ...Object.keys(itemsByCategory)]

  // Smooth‐scroll any in‐page hash links
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!a) return
      e.preventDefault()
      const id = a.getAttribute("href")!.slice(1)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  // Fire an initial scroll event so your tracker highlights the first section
  useEffect(() => {
    const bump = () => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      document.dispatchEvent(new Event("scroll"))
    }
    ;[100, 300, 600].forEach((t) => setTimeout(bump, t))
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
            <TypographyH2 id="about-heading">
              {dict.title}
            </TypographyH2>
            <TypographyP className="mt-2">
              {dict.description}
            </TypographyP>
          </div>
        </section>

        {/* CATEGORY SECTIONS */}
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <section
            key={category}
            id={category}
            data-section-id={category}
            className="min-h-screen snap-center flex items-center justify-center px-6"
            aria-labelledby={`${category}-heading`}
          >
            <div className="max-w-2xl text-center">
              <TypographyH2 id={`${category}-heading`}>
                {category}
              </TypographyH2>
              <div className="mt-4 space-y-3 text-left">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between border-b py-2">
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
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