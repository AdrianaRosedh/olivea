"use client"

import { useEffect } from "react"

export function useSectionObserver(
  setActiveSection: (id: string) => void,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    if (typeof window === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const id = entry.target.getAttribute("data-section-id")
            if (id) setActiveSection(id)
          }
        })
      },
      {
        rootMargin: "-15% 0px -35% 0px", // Top 15%, bottom 35% — center-weighted
        threshold: Array.from({ length: 10 }, (_, i) => i / 10),
        ...options,
      }
    )

    const sections = document.querySelectorAll("[data-section-id]")
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
      observer.disconnect()
    }
  }, [setActiveSection, options])
}