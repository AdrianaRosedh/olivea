"use client"

import { useRef, useEffect, useState } from "react"
import { EVENTS } from "@/lib/navigation-events"

export default function NextGenBackground() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const gradientLayerRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const targetProgressRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  // Smooth animation function for background changes
  const animateBackground = (targetProgress: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const startProgress = scrollProgress
    const startTime = performance.now()
    const duration = 800 // Match the scroll animation duration

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      // Calculate current progress value
      const currentProgress = startProgress + (targetProgress - startProgress) * easedProgress
      setScrollProgress(currentProgress)

      // Update the gradient directly
      updateGradient(currentProgress)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        isAnimatingRef.current = false
        animationFrameRef.current = null
      }
    }

    isAnimatingRef.current = true
    animationFrameRef.current = requestAnimationFrame(animate)
  }

  // Function to update the gradient based on scroll progress
  const updateGradient = (progress: number) => {
    if (!gradientLayerRef.current) return

    // Calculate values based on scroll progress
    const opacity = progress < 0.01 ? 0.8 : progress > 0.99 ? 0.8 : 1
    const hue = 20 + (progress < 0.5 ? progress * 50 : (1 - progress) * 50)
    const saturation = 90 - progress * 60 + (progress > 0.5 ? (progress - 0.5) * 100 : 0)
    const brightness = 85 + progress * 40 - (progress > 0.5 ? (progress - 0.5) * 90 : 0)

    // Update the DOM directly with a smoother transition
    gradientLayerRef.current.style.opacity = opacity.toString()
    gradientLayerRef.current.style.filter = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to update background based on scroll
    const updateBackground = () => {
      // Skip if we're already animating from a programmatic scroll
      if (isAnimatingRef.current) return

      // Find the scroll container
      const scrollContainer = document.querySelector(".scroll-container") || document.documentElement

      // Get scroll values from the appropriate container
      const scrollTop = scrollContainer.scrollTop
      const scrollHeight = scrollContainer.scrollHeight
      const clientHeight = scrollContainer.clientHeight

      // Calculate progress (0 to 1)
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const progress = Math.min(1, scrollTop / maxScroll)

      setScrollProgress(progress)
      updateGradient(progress)

      // Dispatch a custom event that other animation components can listen for
      document.dispatchEvent(
        new CustomEvent("scrollProgressUpdate", {
          detail: { progress },
        }),
      )
    }

    // Listen for scroll events from DockLeft
    const handleScrollStart = () => {
      // We'll let the progress events handle the animation
      isAnimatingRef.current = true
    }

    const handleScrollProgress = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.progress !== undefined) {
        // Get the target progress from the event
        const targetProgress = customEvent.detail.progress

        // Update our progress state
        setScrollProgress(targetProgress)

        // Update the gradient directly
        updateGradient(targetProgress)
      }
    }

    const handleScrollComplete = () => {
      // Wait a bit before resetting the animation flag
      setTimeout(() => {
        isAnimatingRef.current = false

        // Force an update of the background
        updateBackground()
      }, 150)
    }

    // Listen for the enableScrollAnimations event
    const handleEnableScrollAnimations = () => {
      // Reset animation state
      isAnimatingRef.current = false

      // Force an update of the background
      updateBackground()
    }

    // Update immediately
    updateBackground()

    // Use passive event listener for better performance
    const scrollContainer = document.querySelector(".scroll-container") || window
    scrollContainer.addEventListener("scroll", updateBackground, { passive: true })

    // Listen for scroll events from DockLeft
    document.addEventListener(EVENTS.SCROLL_START, handleScrollStart)
    document.addEventListener(EVENTS.SCROLL_PROGRESS, handleScrollProgress)
    document.addEventListener(EVENTS.SCROLL_COMPLETE, handleScrollComplete)
    document.addEventListener("enableScrollAnimations", handleEnableScrollAnimations)

    // Force multiple updates to ensure it works
    const timers = [
      setTimeout(updateBackground, 100),
      setTimeout(updateBackground, 500),
      setTimeout(updateBackground, 1000),
    ]

    // Cleanup
    return () => {
      scrollContainer.removeEventListener("scroll", updateBackground)
      document.removeEventListener(EVENTS.SCROLL_START, handleScrollStart)
      document.removeEventListener(EVENTS.SCROLL_PROGRESS, handleScrollProgress)
      document.removeEventListener(EVENTS.SCROLL_COMPLETE, handleScrollComplete)
      document.removeEventListener("enableScrollAnimations", handleEnableScrollAnimations)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      {/* Base layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--olivea-cream)] to-[var(--olivea-shell)]" />

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
