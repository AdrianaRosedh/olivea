"use client"

import { useEffect, useState } from "react"

export function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string | null>(sectionIds[0])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const section = document.getElementById(id)
      if (!section) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(id)
          }
        },
        {
          rootMargin: "-30% 0px -60% 0px",
          threshold: 0.2,
        }
      )

      observer.observe(section)
      observers.push(observer)
    })

    return () => {
      observers.forEach((o) => o.disconnect())
    }
  }, [sectionIds])

  return active
}