"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { EVENTS, emitEvent } from "@/lib/navigation-events"
import { SECTION_EVENTS } from "@/lib/section-navigation"

export default function MobileScrollInitializer() {
  const pathname = usePathname()
  const initCountRef = useRef(0)
  const hasInitializedRef = useRef(false)
  const isMobileRef = useRef(false)
  const lastActiveSection = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Detect mobile device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    if (!isMobileDevice) return
    isMobileRef.current = true
    console.log("[MobileScrollInit] Mobile device detected, initializing")

    // Helper: check which section is most visible
    const checkVisibleSections = () => {
      const sections: HTMLElement[] = Array.from(
        document.querySelectorAll<HTMLElement>("section[id]")
      )
      if (sections.length === 0) return

      let activeSection: HTMLElement | null = null
      let maxVisibility = 0

      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        const vh = window.innerHeight
        const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
        const visibility = visibleHeight / rect.height
        if (visibility > maxVisibility) {
          maxVisibility = visibility
          activeSection = section
        }
      }

      if (activeSection && activeSection.id !== lastActiveSection.current) {
        lastActiveSection.current = activeSection.id
        console.log(`[MobileScrollInit] Active section: ${activeSection.id}`)

        document.dispatchEvent(
          new CustomEvent(SECTION_EVENTS.SECTION_IN_VIEW, {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
              source: "mobile-initializer",
            },
          })
        )
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: activeSection.id,
              intersectionRatio: maxVisibility,
              source: "mobile-initializer",
            },
          })
        )
      }
    }

    // Initialization logic
    const initializeMobileScroll = () => {
      const count = ++initCountRef.current
      console.log(`MobileScrollInit attempt ${count} for ${pathname}`)

      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      window.dispatchEvent(new Event("scroll"))

      checkVisibleSections()
      emitEvent(EVENTS.MOBILE_SCROLL_INITIALIZED, { count })
      hasInitializedRef.current = true
    }

    // Kick off multiple init attempts
    initializeMobileScroll()
    const timers = [
      setTimeout(initializeMobileScroll, 100),
      setTimeout(initializeMobileScroll, 300),
      setTimeout(initializeMobileScroll, 600),
      setTimeout(initializeMobileScroll, 1000),
    ]

    // Scroll listener
    let scrollTimeout: number | null = null
    const onScroll = () => {
      if (scrollTimeout) return
      scrollTimeout = window.setTimeout(() => {
        scrollTimeout = null
        checkVisibleSections()
      }, 50)
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    // Reinitialize on navigation
    const onNavComplete = () => {
      initCountRef.current = 0
      lastActiveSection.current = null
      setTimeout(initializeMobileScroll, 100)
      setTimeout(initializeMobileScroll, 300)
    }
    document.addEventListener(EVENTS.NAVIGATION_COMPLETE, onNavComplete)

    // Other triggers
    const onReadyState = () => {
      if (document.readyState === "complete" && !hasInitializedRef.current) {
        initializeMobileScroll()
      }
    }
    document.addEventListener("readystatechange", onReadyState)
    window.addEventListener("load", initializeMobileScroll)

    const onInteraction = () => {
      if (initCountRef.current < 3) initializeMobileScroll()
    }
    document.addEventListener("touchstart", onInteraction, { once: true })

    // Cleanup
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener(EVENTS.NAVIGATION_COMPLETE, onNavComplete)
      document.removeEventListener("readystatechange", onReadyState)
      window.removeEventListener("load", initializeMobileScroll)
      document.removeEventListener("touchstart", onInteraction)
      if (scrollTimeout !== null) clearTimeout(scrollTimeout)
    }
  }, [pathname])

  return null
}
