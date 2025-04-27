"use client"

import { useState, useEffect } from "react"

export default function ScrollAnimatedBackground() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to calculate scroll progress
    const calculateScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight) // Avoid division by zero
      const progress = Math.min(1, scrollTop / maxScroll)
      setScrollProgress(progress)
    }

    // Calculate immediately
    calculateScroll()

    // Add event listener with passive option for better performance
    const handleScroll = () => {
      requestAnimationFrame(calculateScroll)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Force recalculation after a short delay to ensure correct values
    const timer = setTimeout(calculateScroll, 200)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [])

  // Calculate derived values based on scroll progress
  const opacity = scrollProgress < 0.01 ? 0.8 : scrollProgress > 0.99 ? 0.8 : 1

  // Map scroll progress to hue, saturation, and brightness values
  const hue = 20 + (scrollProgress < 0.5 ? scrollProgress * 50 : (1 - scrollProgress) * 50)
  const saturation = 90 - scrollProgress * 60 + (scrollProgress > 0.5 ? (scrollProgress - 0.5) * 100 : 0)
  const brightness = 85 + scrollProgress * 40 - (scrollProgress > 0.5 ? (scrollProgress - 0.5) * 90 : 0)

  // Create the CSS filter string
  const filterStyle = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      {/* Base layer - Updated with lightened colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--olivea-cream)] to-[var(--olivea-shell)]" />

      {/* Light transition layer - Updated with lightened colors */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#e8e4d5] via-[#e0d9c5] to-[#d5ceb8]"
        style={{
          opacity,
          filter: filterStyle,
          transition: "filter 0.3s ease-out",
        }}
      />

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
    </div>
  )
}
