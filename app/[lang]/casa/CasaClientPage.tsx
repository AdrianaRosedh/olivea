"use client"

import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import { useEffect, useRef, useState } from "react"
import MobileSectionTracker from "@/components/MobileSectionTracker"

export default function CasaClientPage({ lang, dict }: { lang: string; dict: any }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sectionIds = ["rooms", "breakfast", "experiences", "location"]

  function notifySectionChange(sectionId: string) {
    document.dispatchEvent(new CustomEvent("sectionInView", { detail: { id: sectionId, intersectionRatio: 1.0 } }))
  }

  function forceUpdateSections() {
    const sections = document.querySelectorAll("section[id]")
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const visibleTop = Math.max(0, rect.top)
      const visibleBottom = Math.min(windowHeight, rect.bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)
      const visibility = visibleHeight / rect.height
      if (visibility > 0.3) {
        notifySectionChange(section.id)
      }
    })
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement
      if (link) {
        e.preventDefault()
        const sectionId = link.getAttribute("href")?.substring(1)
        const section = document.getElementById(sectionId!)
        if (section && containerRef.current) {
          containerRef.current.scrollTo({ top: section.offsetTop, behavior: "smooth" })
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
          scrollTimeoutRef.current = setTimeout(() => notifySectionChange(sectionId!), 800)
        }
      }
    }
    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const force = () => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      document.dispatchEvent(new Event("scroll"))
    }
    force()
    const timers = [100, 300, 600, 1000].map((t) => setTimeout(force, t))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="min-h-screen overflow-y-auto pb-[120px] md:pb-0"
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          scrollSnapType: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "y none" : "y proximity",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {sectionIds.map((id) => (
          <section
            key={id}
            id={id}
            data-section-id={id}
            className="min-h-screen w-full flex items-center justify-center px-6 snap-center"
            aria-labelledby={`${id}-heading`}
          >
            <div>
              <TypographyH2 id={`${id}-heading`}>{dict.casa.sections[id]?.title}</TypographyH2>
              <TypographyP className="mt-2">{dict.casa.sections[id]?.description}</TypographyP>
            </div>
          </section>
        ))}
      </div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  )
}