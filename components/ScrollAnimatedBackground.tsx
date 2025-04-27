"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function ScrollAnimatedBackground() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)

  // Find the scroll container on mount
  useEffect(() => {
    // First try to find the .scroll-container element
    const container = document.querySelector<HTMLElement>(".scroll-container")
    setScrollContainer(container)

    // If not found, fall back to document.documentElement
    if (!container) {
      console.warn("Scroll container not found, falling back to document")
      setScrollContainer(document.documentElement)
    }
  }, [])

  // Manual scroll tracking for more reliable results
  useEffect(() => {
    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const maxScroll = scrollHeight - clientHeight
      const current = scrollTop / maxScroll
      setScrollProgress(current || 0) // Ensure we don't get NaN
    }

    // Initial calculation
    handleScroll()

    // Add event listener
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true })

    // Cleanup
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [scrollContainer])

  // Calculate derived values based on scroll progress
  const opacity = scrollProgress < 0.01 ? 0.8 : scrollProgress > 0.99 ? 0.8 : 1

  // Map scroll progress to hue, saturation, and brightness values
  const hue = 20 + (scrollProgress < 0.5 ? scrollProgress * 50 : (1 - scrollProgress) * 50)
  const saturation = 90 - scrollProgress * 60 + (scrollProgress > 0.5 ? (scrollProgress - 0.5) * 100 : 0)
  const brightness = 85 + scrollProgress * 40 - (scrollProgress > 0.5 ? (scrollProgress - 0.5) * 90 : 0)

  // Create the CSS filter string
  const filterStyle = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`

  return (
    <>
      {/* Debug indicator - remove in production */}
      <div className="fixed top-2 left-2 z-50 bg-black/70 text-white px-2 py-1 text-xs rounded">
        Scroll: {Math.round(scrollProgress * 100)}%
      </div>

      <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        {/* Base layer - Updated with lightened colors */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--olivea-cream)] to-[var(--olivea-shell)]" />

        {/* Light transition layer - Updated with lightened colors */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#e8e4d5] via-[#e0d9c5] to-[#d5ceb8]"
          style={{
            opacity,
            filter: filterStyle,
          }}
        />

        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
      </div>
    </>
  )
}
