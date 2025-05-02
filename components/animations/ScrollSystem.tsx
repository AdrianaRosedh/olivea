// components/animations/ScrollSystem.tsx
"use client"

import { useEffect, useRef, useState, createContext, useContext } from "react"
import { usePathname } from "next/navigation"

export type ScrollContextType = {
  activeSection: string | null
  scrollProgress: number
  scrollTo: (sectionId: string) => void
  isScrolling: boolean
}
const ScrollContext = createContext<ScrollContextType>({
  activeSection: null,
  scrollProgress: 0,
  scrollTo: () => {},
  isScrolling: false,
})
export const useScroll = () => useContext(ScrollContext)

export default function ScrollSystem({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const pathname = usePathname()

  const scrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    scrollContainerRef.current =
      document.querySelector<HTMLElement>(".scroll-container") ||
      document.documentElement

    const updateScrollProgress = () => {
      const c = scrollContainerRef.current!
      const max = Math.max(1, c.scrollHeight - c.clientHeight)
      setScrollProgress(Math.min(1, Math.max(0, c.scrollTop / max)))
    }

    const updateActiveSection = () => {
      if (scrollingRef.current) return

      // ← Here’s the key change:
      //   querySelectorAll<HTMLElement> + Array.from → HTMLElement[]
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("section[id]")
      )

      if (sections.length === 0) return

      let best: HTMLElement | null = null
      let bestScore = 0

      for (const sec of sections) {
        const r = sec.getBoundingClientRect()
        const vh = window.innerHeight

        const visTop = Math.max(0, r.top)
        const visBottom = Math.min(vh, r.bottom)
        const visHeight = Math.max(0, visBottom - visTop)
        const visibility = visHeight / r.height

        const centerDist = Math.abs((r.top + r.bottom) / 2 - vh / 2)
        const centerWeight = 1 - Math.min(1, centerDist / (vh / 2))

        const score = visibility * 0.7 + centerWeight * 0.3
        if (score > bestScore) {
          bestScore = score
          best = sec
        }
      }

      if (best && best.id !== activeSection) {
        setActiveSection(best.id)
      }
    }

    const onScroll = () => {
      if (scrollingRef.current) return
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

      updateScrollProgress()
      scrollTimeoutRef.current = setTimeout(() => {
        updateActiveSection()
        scrollTimeoutRef.current = null
      }, 50)
    }

    const container = scrollContainerRef.current!
    container.addEventListener("scroll", onScroll, { passive: true })

    // initial
    updateScrollProgress()
    updateActiveSection()

    const retries = [
      setTimeout(() => { updateScrollProgress(); updateActiveSection() }, 100),
      setTimeout(() => { updateScrollProgress(); updateActiveSection() }, 500),
    ]

    return () => {
      container.removeEventListener("scroll", onScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      retries.forEach(clearTimeout)
    }
  }, [pathname, activeSection])

  const scrollTo = (sectionId: string) => {
    const container = scrollContainerRef.current!
    const sec = document.getElementById(sectionId)
    if (!sec) return

    scrollingRef.current = true
    setIsScrolling(true)
    window.history.pushState(null, "", `#${sectionId}`)
    setActiveSection(sectionId)

    container.scrollTo({ top: sec.offsetTop, behavior: "smooth" })

    setTimeout(() => {
      scrollingRef.current = false
      setIsScrolling(false)
    }, 1000)
  }

  return (
    <ScrollContext.Provider value={{ activeSection, scrollProgress, scrollTo, isScrolling }}>
      {children}
    </ScrollContext.Provider>
  )
}