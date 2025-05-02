"use client"

import React, { useEffect, useRef } from "react"
import { TypographyH2, TypographyP }   from "@/components/ui/Typography"
import MobileSectionTracker            from "@/components/MobileSectionTracker"
import type { Lang }                   from "../dictionaries"

// 1️⃣ Define your literal‐tuple for sections
const ALL_SECTIONS = ["story", "garden", "menu", "wines"] as const
type SectionKey = (typeof ALL_SECTIONS)[number]  // "story" | "garden" | "menu" | "wines"

export interface SectionDict {
  title:       string
  description: string
  error?:      string
}

// 2️⃣ Use Lang for lang‐prop, not string
export interface RestaurantClientPageProps {
  lang:     Lang
  sections: Partial<Record<SectionKey, SectionDict>>
}

export default function RestaurantClientPage({
  lang,
  sections,
}: RestaurantClientPageProps) {
  const containerRef     = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<number | null>(null)

  // 3️⃣ Copy your readonly tuple into a mutable array
  const sectionIds: SectionKey[] = [...ALL_SECTIONS]

  function notifySectionChange(sectionId: SectionKey) {
    document.dispatchEvent(
      new CustomEvent("sectionInView", {
        detail: { id: sectionId, intersectionRatio: 1.0 },
      })
    )
  }

  // 4️⃣ Smooth‐scroll anchor links inside this scroll‐container
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!a) return
      e.preventDefault()
      const id = a.getAttribute("href")!.slice(1) as SectionKey
      const el = document.getElementById(id)
      if (el && containerRef.current) {
        containerRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" })
        if (scrollTimeoutRef.current !== null) {
          clearTimeout(scrollTimeoutRef.current)
        }
        scrollTimeoutRef.current = window.setTimeout(
          () => notifySectionChange(id),
          800
        )
      }
    }
    document.addEventListener("click", onClick)
    return () => {
      document.removeEventListener("click", onClick)
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // 5️⃣ “Bump” the scroll once on mount so your IntersectionObservers fire immediately
  useEffect(() => {
    const bump = () => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      document.dispatchEvent(new Event("scroll"))
    }
    ;[100, 300, 600].forEach((ms) => setTimeout(bump, ms))
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
        {sectionIds.map((id) => {
          const info = sections[id]
          return (
            <section
              key={id}
              id={id}
              data-section-id={id}
              className="min-h-screen snap-center flex flex-col items-center justify-center px-6"
              aria-labelledby={`${id}-heading`}
            >
              <div className="max-w-2xl text-center">
                <TypographyH2 id={`${id}-heading`}>
                  {info?.title}
                </TypographyH2>
                <TypographyP className="mt-2">
                  {info?.description}
                </TypographyP>
              </div>
            </section>
          )
        })}
      </div>

      <MobileSectionTracker sectionIds={sectionIds as string[]} />
    </>
  )
}