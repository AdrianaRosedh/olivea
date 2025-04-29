"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function AnimationInitializer() {
  const hasInitializedRef = useRef(false)
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to force initialize all animations and scroll detection
    const forceInitializeAnimations = () => {
      console.log("[AnimationInitializer] Forcing animation initialization")

      // 1. Force scroll events
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      window.dispatchEvent(new Event("scroll"))

      // 2. Find all sections and force layout recalculation
      const sections = document.querySelectorAll("section[id]")
      sections.forEach((section) => {
        // Force layout recalculation
        section.getBoundingClientRect()
      })

      // 3. Dispatch custom events
      document.dispatchEvent(new CustomEvent("observers:reinitialize"))
      document.dispatchEvent(new CustomEvent("animations:initialize"))
      document.dispatchEvent(new CustomEvent("navigation:complete"))
      document.dispatchEvent(new CustomEvent("scroll:initialize"))

      // 4. Force animation frames
      requestAnimationFrame(() => {
        // Force another scroll event inside animation frame
        window.dispatchEvent(new Event("scroll"))

        // Force resize event to recalculate any responsive elements
        window.dispatchEvent(new Event("resize"))
      })

      hasInitializedRef.current = true
    }

    // Run initialization immediately
    forceInitializeAnimations()

    // Run multiple times with increasing delays to ensure it works
    const timers = [
      setTimeout(forceInitializeAnimations, 100),
      setTimeout(forceInitializeAnimations, 300),
      setTimeout(forceInitializeAnimations, 600),
      setTimeout(forceInitializeAnimations, 1000),
      setTimeout(forceInitializeAnimations, 2000),
    ]

    // Also initialize on user interaction
    const handleUserInteraction = () => {
      if (!hasInitializedRef.current) {
        forceInitializeAnimations()
      }
    }

    document.addEventListener("click", handleUserInteraction, { once: true })
    document.addEventListener("touchstart", handleUserInteraction, { once: true })

    return () => {
      timers.forEach(clearTimeout)
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [pathname]) // Re-run when pathname changes

  return null // This component doesn't render anything
}
