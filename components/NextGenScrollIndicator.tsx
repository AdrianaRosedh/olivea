"use client"

import { useEffect, useState } from "react"

export default function NextGenScrollIndicator() {
  const [scrollPercentage, setScrollPercentage] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to update scroll percentage
    const updateScrollPercentage = () => {
      // Find the scroll container
      const scrollContainer = document.querySelector(".scroll-container") || document.documentElement

      // Get scroll values from the appropriate container
      const scrollTop = scrollContainer.scrollTop
      const scrollHeight = scrollContainer.scrollHeight
      const clientHeight = scrollContainer.clientHeight

      // Calculate percentage
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const percentage = Math.min(100, Math.round((scrollTop / maxScroll) * 100))

      setScrollPercentage(percentage)
    }

    // Update immediately
    updateScrollPercentage()

    // Use passive event listener for better performance
    const scrollContainer = document.querySelector(".scroll-container") || window
    scrollContainer.addEventListener("scroll", updateScrollPercentage, { passive: true })

    // Force multiple updates to ensure it works
    const timers = [
      setTimeout(updateScrollPercentage, 100),
      setTimeout(updateScrollPercentage, 500),
      setTimeout(updateScrollPercentage, 1000),
    ]

    // Cleanup
    return () => {
      scrollContainer.removeEventListener("scroll", updateScrollPercentage)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="fixed top-2 left-2 z-[9999] bg-black/70 text-white px-2 py-1 text-xs rounded pointer-events-none">
      Scroll: {scrollPercentage}%
    </div>
  )
}
