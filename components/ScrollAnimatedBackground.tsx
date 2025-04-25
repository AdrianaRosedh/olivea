"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"

export default function ScrollAnimatedBackground() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef(null)

  // Use scroll progress from the document
  const { scrollYProgress } = useScroll({
    // Don't specify a target to track the entire viewport scroll
    offset: ["start start", "end end"],
  })

  // Log scroll progress for debugging
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest)
  })

  // Make the animation values more pronounced

  // Light transition values - more dramatic shifts
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const lightHue = useTransform(scrollYProgress, [0, 0.5, 1], [20, 45, 10]) // Golden → Bright → Warm
  const lightSaturation = useTransform(scrollYProgress, [0, 0.5, 1], [90, 30, 80]) // %
  const lightBrightness = useTransform(scrollYProgress, [0, 0.5, 1], [85, 105, 80]) // %


  // Combine light values into a CSS filter
  const lightFilter = useTransform(
    [lightHue, lightSaturation, lightBrightness],
    ([h, s, l]) => `hue-rotate(${h}deg) saturate(${s}%) brightness(${l}%)`,
  )

  return (
    <>
      {/* Debug indicator - remove in production */}
      <div className="fixed top-2 left-2 z-50 bg-black/70 text-white px-2 py-1 text-xs rounded">
        Scroll: {Math.round(scrollProgress * 100)}%
      </div>

      <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        {/* Base layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--olivea-cream)] to-[var(--olivea-shell)]" />

        {/* Light transition layer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#f8e3c5] via-[#e9e8e5] to-[#d8d0c0]"
          style={{
            opacity,
            filter: lightFilter,
          }}
        />

        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
      </div>
    </>
  )
}
