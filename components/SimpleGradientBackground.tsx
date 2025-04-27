"use client"

import { useState, useEffect } from "react"

export default function SimpleGradientBackground() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to calculate scroll progress
    const calculateScrollProgress = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight) // Avoid division by zero
      const progress = Math.min(1, scrollTop / maxScroll)
      setScrollProgress(progress)
    }

    // Calculate immediately
    calculateScrollProgress()

    // Add scroll event listener
    window.addEventListener("scroll", calculateScrollProgress, { passive: true })

    // Force recalculation after a short delay to ensure correct values
    const timer = setTimeout(calculateScrollProgress, 200)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", calculateScrollProgress)
      clearTimeout(timer)
    }
  }, [])

  // Calculate color values based on scroll progress
  const hue = 20 + scrollProgress * 40
  const saturation = 90 - scrollProgress * 30
  const lightness = 85 + scrollProgress * 10

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: `linear-gradient(135deg, 
          hsl(${hue}, ${saturation}%, ${lightness}%) 0%, 
          hsl(${hue + 20}, ${saturation - 10}%, ${lightness - 5}%) 100%)`,
        opacity: 0.8,
        transition: "background 0.3s ease-out",
      }}
    />
  )
}
