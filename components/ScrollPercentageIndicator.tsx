"use client"

import { useState, useEffect } from "react"

export default function ScrollPercentageIndicator() {
  const [scrollPercentage, setScrollPercentage] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to calculate scroll percentage
    const calculateScrollPercentage = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight) // Avoid division by zero
      const percentage = Math.min(100, Math.round((scrollTop / maxScroll) * 100))
      setScrollPercentage(percentage)
    }

    // Calculate immediately
    calculateScrollPercentage()

    // Add event listener with passive option for better performance
    const handleScroll = () => {
      requestAnimationFrame(calculateScrollPercentage)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Force recalculation after a short delay to ensure correct values
    const timer = setTimeout(calculateScrollPercentage, 200)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="fixed top-2 left-2 z-[1000] bg-black/70 text-white px-2 py-1 text-xs rounded">
      Scroll: {scrollPercentage}%
    </div>
  )
}
