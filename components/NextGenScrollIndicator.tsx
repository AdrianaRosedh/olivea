"use client"

import { useRef, useEffect } from "react"

export default function NextGenScrollIndicator() {
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Create indicator if it doesn't exist yet
    if (!indicatorRef.current) return

    const indicator = indicatorRef.current

    // Function to update scroll percentage
    const updateScrollPercentage = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const percentage = Math.min(100, Math.round((scrollTop / maxScroll) * 100))

      // Update the DOM directly to avoid React rendering issues
      if (indicator) {
        indicator.textContent = `Scroll: ${percentage}%`
      }
    }

    // Update immediately
    updateScrollPercentage()

    // Use passive event listener for better performance
    window.addEventListener("scroll", updateScrollPercentage, { passive: true })

    // Force multiple updates to ensure it works
    const timers = [
      setTimeout(updateScrollPercentage, 100),
      setTimeout(updateScrollPercentage, 500),
      setTimeout(updateScrollPercentage, 1000),
    ]

    // Cleanup
    return () => {
      window.removeEventListener("scroll", updateScrollPercentage)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div
      ref={indicatorRef}
      className="fixed top-2 left-2 z-[9999] bg-black/70 text-white px-2 py-1 text-xs rounded pointer-events-none"
    >
      Scroll: 0%
    </div>
  )
}
