"use client"

import { useRef, useEffect } from "react"

export default function NextGenBackground() {
  const baseLayerRef = useRef<HTMLDivElement>(null)
  const gradientLayerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Get references to the DOM elements
    const gradientLayer = gradientLayerRef.current
    if (!gradientLayer) return

    // Function to update background based on scroll
    const updateBackground = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const progress = Math.min(1, scrollTop / maxScroll)

      // Calculate values based on scroll progress
      const opacity = progress < 0.01 ? 0.8 : progress > 0.99 ? 0.8 : 1
      const hue = 20 + (progress < 0.5 ? progress * 50 : (1 - progress) * 50)
      const saturation = 90 - progress * 60 + (progress > 0.5 ? (progress - 0.5) * 100 : 0)
      const brightness = 85 + progress * 40 - (progress > 0.5 ? (progress - 0.5) * 90 : 0)

      // Update the DOM directly
      gradientLayer.style.opacity = opacity.toString()
      gradientLayer.style.filter = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`
    }

    // Update immediately
    updateBackground()

    // Use passive event listener for better performance
    window.addEventListener("scroll", updateBackground, { passive: true })

    // Force multiple updates to ensure it works
    const timers = [
      setTimeout(updateBackground, 100),
      setTimeout(updateBackground, 500),
      setTimeout(updateBackground, 1000),
    ]

    // Cleanup
    return () => {
      window.removeEventListener("scroll", updateBackground)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      {/* Base layer */}
      <div
        ref={baseLayerRef}
        className="absolute inset-0 bg-gradient-to-b from-[var(--olivea-cream)] to-[var(--olivea-shell)]"
      />

      {/* Gradient layer */}
      <div
        ref={gradientLayerRef}
        className="absolute inset-0 bg-gradient-to-br from-[#e8e4d5] via-[#e0d9c5] to-[#d5ceb8]"
        style={{
          opacity: 0.8,
          filter: "hue-rotate(20deg) saturate(90%) brightness(85%)",
          transition: "filter 0.3s ease-out, opacity 0.3s ease-out",
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
    </div>
  )
}
