"use client"

import { useRef, useEffect, useState } from "react"
import { EVENTS, getScrollProgress } from "@/lib/navigation-events"

export default function NextGenBackground() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const gradientLayerRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const debugModeRef = useRef(false)

  // Debug logger
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[NextGenBackground]", ...args)
    }
  }

  // Function to update the gradient based on scroll progress
  const updateGradient = (progress: number) => {
    if (!gradientLayerRef.current) return

    const opacity = progress < 0.01 ? 0.8 : progress > 0.99 ? 0.8 : 1
    const hue = 20 + (progress < 0.5 ? progress * 50 : (1 - progress) * 50)
    const saturation =
      90 - progress * 60 + (progress > 0.5 ? (progress - 0.5) * 100 : 0)
    const brightness =
      85 + progress * 40 - (progress > 0.5 ? (progress - 0.5) * 90 : 0)

    gradientLayerRef.current.style.opacity = opacity.toString()
    gradientLayerRef.current.style.filter =
      `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`
  }

  // Smooth animation function for background changes
  const animateToProgress = (targetProgress: number, duration = 800) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    const startProgress = scrollProgress
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentProgress =
        startProgress + (targetProgress - startProgress) * easedProgress
      setScrollProgress(currentProgress)
      updateGradient(currentProgress)

      if (progress < 1) {
        animationFrameRef.current =
          requestAnimationFrame(animate)
      } else {
        isAnimatingRef.current = false
        animationFrameRef.current = null
      }
    }

    isAnimatingRef.current = true
    animationFrameRef.current =
      requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateBackground = () => {
      if (isAnimatingRef.current) return
      const progress = getScrollProgress()
      setScrollProgress(progress)
      updateGradient(progress)
    }

    const handleScrollStart = () => {
      isAnimatingRef.current = true
    }

    const handleScrollProgress = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.totalProgress !== undefined) {
        const targetProgress = customEvent.detail.totalProgress
        setScrollProgress(targetProgress)
        updateGradient(targetProgress)
      } else if (customEvent.detail?.progress !== undefined) {
        const targetProgress = customEvent.detail.progress
        setScrollProgress(targetProgress)
        updateGradient(targetProgress)
      }
    }

    const handleScrollComplete = () => {
      setTimeout(() => {
        isAnimatingRef.current = false
        updateBackground()
      }, 50)
    }

    const handleSectionSnapStart = (e: Event) => {
      const customEvent = e as CustomEvent
      isAnimatingRef.current = true
      if (
        customEvent.detail?.startPosition !== undefined &&
        customEvent.detail?.targetPosition !== undefined
      ) {
        debugLog("Section snap start", customEvent.detail)
      }
    }

    const handleSectionSnapComplete = (e: Event) => {
      const customEvent = e as CustomEvent
      setTimeout(() => {
        isAnimatingRef.current = false
        updateBackground()
      }, 50)
    }

    const handleSectionChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (
        customEvent.detail?.source !== "scroll" &&
        customEvent.detail?.source !== "click"
      ) {
        const progress = getScrollProgress()
        animateToProgress(progress, 400)
      }
    }

    const handleSectionInView = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.id) {
        const sections = document.querySelectorAll("section[id]")
        const sectionArray = Array.from(sections)
        const sectionIndex = sectionArray.findIndex(
          (section) => section.id === customEvent.detail.id
        )
        if (sectionIndex !== -1) {
          const progress = sectionIndex / (sectionArray.length - 1)
          animateToProgress(progress, 800)
        }
      }
    }

    updateBackground()

    const scrollContainer =
      document.querySelector(".scroll-container") || window
    scrollContainer.addEventListener("scroll", updateBackground, {
      passive: true,
    })

    // Listen for section events
    document.addEventListener(EVENTS.SECTION_CHANGE, handleSectionChange)
    document.addEventListener(EVENTS.SECTION_SNAP_START, handleSectionSnapStart)
    document.addEventListener(
      EVENTS.SECTION_SNAP_COMPLETE,
      handleSectionSnapComplete
    )
    document.addEventListener(
      "sectionInView",
      handleSectionInView
    )

    // Remove old scroll start/progress complete events
    document.addEventListener(EVENTS.SCROLL_INITIALIZE, handleScrollStart)
    document.addEventListener(EVENTS.SCROLL_PROGRESS, handleScrollProgress)
    document.addEventListener(EVENTS.NAVIGATION_COMPLETE, handleScrollComplete)

    const timers = [
      setTimeout(updateBackground, 100),
      setTimeout(updateBackground, 500),
      setTimeout(updateBackground, 1000),
    ]

    return () => {
      scrollContainer.removeEventListener(
        "scroll",
        updateBackground
      )
      document.removeEventListener(
        EVENTS.SCROLL_INITIALIZE,
        handleScrollStart
      )
      document.removeEventListener(
        EVENTS.SCROLL_PROGRESS,
        handleScrollProgress
      )
      document.removeEventListener(
        EVENTS.NAVIGATION_COMPLETE,
        handleScrollComplete
      )
      document.removeEventListener(
        EVENTS.SECTION_CHANGE,
        handleSectionChange
      )
      document.removeEventListener(
        EVENTS.SECTION_SNAP_START,
        handleSectionSnapStart
      )
      document.removeEventListener(
        EVENTS.SECTION_SNAP_COMPLETE,
        handleSectionSnapComplete
      )
      document.removeEventListener(
        "sectionInView",
        handleSectionInView
      )

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--olivea-cream)] to-[var(--olivea-shell)]" />
      <div
        ref={gradientLayerRef}
        className="absolute inset-0 bg-gradient-to-br from-[#e8e4d5] via-[#e0d9c5] to-[#d5ceb8]"
        style={{
          opacity: 0.8,
          filter: "hue-rotate(20deg) saturate(90%) brightness(85%)",
          transition: "filter 0.3s ease-out, opacity 0.3s ease-out",
        }}
      />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
    </div>
  )
}
