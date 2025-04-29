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
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section-id")
            if (id) {
              setActiveSection(id)
            }
          }
        })
      },
      {
        rootMargin: "0px 0px -60% 0px",
        threshold: 0.2,
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