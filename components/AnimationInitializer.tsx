"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function AnimationInitializer() {
  const pathname = usePathname()
  const initCountRef = useRef(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Reset counter on navigation
    initCountRef.current = 0

    // Function to force initialize animations
    const forceInitializeAnimations = () => {
      const count = ++initCountRef.current
      console.log(`[AnimationInitializer] Initializing animations (attempt ${count})`)

      // Dispatch animation initialization events
      document.dispatchEvent(new CustomEvent("animations:initialize"))

      // Force layout recalculation for animated elements - use separate selectors
      const animatedElements = [
        ...document.querySelectorAll("[data-animate]"),
        ...document.querySelectorAll("[class*='animate-']"),
        ...document.querySelectorAll("[class*='transition-']"),
      ]

      animatedElements.forEach((el) => {
        // Force layout recalculation
        el.getBoundingClientRect()
      })

      // Force a scroll event to trigger scroll-based animations
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      window.dispatchEvent(new Event("scroll"))

      // Force a resize event to recalculate responsive animations
      window.dispatchEvent(new Event("resize"))
    }

    // Run initialization with increasing delays
    const timers = [
      setTimeout(forceInitializeAnimations, 0),
      setTimeout(forceInitializeAnimations, 100),
      setTimeout(forceInitializeAnimations, 300),
      setTimeout(forceInitializeAnimations, 600),
      setTimeout(forceInitializeAnimations, 1000),
    ]

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [pathname]) // Re-run when pathname changes

  return null // This component doesn't render anything
}
