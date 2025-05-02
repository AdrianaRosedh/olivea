// components/animations/ScrollSyncMobile.tsx
"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { SECTION_EVENTS } from "@/lib/section-navigation"

export default function ScrollSyncMobile() {
  const pathname = usePathname()
  const lastSectionRef = useRef<string | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobileRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // 1️⃣ detect mobile UA
    const ua = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    isMobileRef.current = isMobile
    if (!isMobile) return

    console.log("[ScrollSyncMobile] initializing scroll sync on mobile")

    // 2️⃣ pick your scroll container
    const scrollContainer: HTMLElement =
      (document.querySelector(".scroll-container") as HTMLElement) ||
      document.documentElement

    // 3️⃣ find the most visible <section>
    const checkVisibleSections = () => {
      // force TS to treat this NodeList as HTMLElements
      const nodeList = document.querySelectorAll("section[id]") as NodeListOf<HTMLElement>
      if (nodeList.length === 0) return

      let bestSection: HTMLElement | null = null
      let bestVisibility = 0

      for (const section of nodeList) {
        const rect = section.getBoundingClientRect()
        const vh = window.innerHeight
        const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
        const visibility = visibleHeight / rect.height

        if (visibility > bestVisibility) {
          bestVisibility = visibility
          bestSection = section
        }
      }

      if (
        bestSection &&
        bestSection.id !== lastSectionRef.current
      ) {
        lastSectionRef.current = bestSection.id
        console.log(`[ScrollSyncMobile] new active section: ${bestSection.id}`)

        // dispatch typed + legacy events
        document.dispatchEvent(
          new CustomEvent(SECTION_EVENTS.SECTION_IN_VIEW, {
            detail: {
              id: bestSection.id,
              intersectionRatio: bestVisibility,
              source: "mobile-scroll",
            },
          })
        )
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: bestSection.id,
              intersectionRatio: bestVisibility,
              source: "mobile-scroll",
            },
          })
        )
      }
    }

    // 4️⃣ throttle
    const onScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(checkVisibleSections, 50)
    }

    // 5️⃣ attach listeners
    window.addEventListener("scroll", onScroll, { passive: true })
    scrollContainer.addEventListener("scroll", onScroll, { passive: true })

    // 6️⃣ kick off a few times for late-mounting sections
    setTimeout(checkVisibleSections, 100)
    setTimeout(checkVisibleSections, 500)
    setTimeout(checkVisibleSections, 1000)

    // 7️⃣ cleanup
    return () => {
      window.removeEventListener("scroll", onScroll)
      scrollContainer.removeEventListener("scroll", onScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [pathname])

  return null
}