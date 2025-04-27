"use client"

import { useEffect, useRef } from "react"

export default function MobileAudioFeedback() {
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Track state
  const isPlayingRef = useRef(false)
  const lastPlayTimeRef = useRef(0)
  const lastSectionRef = useRef<string | null>(null)
  const initialLoadCompleteRef = useRef(false)
  const userHasInteractedRef = useRef(false)
  const debugModeRef = useRef(true) // Enable debug logs

  // Debug logger
  const debugLog = (...args: any[]) => {
    if (debugModeRef.current) {
      console.log("[MobileAudioFeedback]", ...args)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    debugLog("Component mounted")

    // Create audio element immediately but don't play it
    audioRef.current = new Audio("/sounds/scroll-click.mp3")
    audioRef.current.volume = 0.3
    audioRef.current.preload = "auto"

    try {
      audioRef.current.load()
      debugLog("Audio element created and loaded")
    } catch (err) {
      console.error("Error loading audio:", err)
    }

    // After 3 seconds, mark initial load as complete
    const initialLoadTimer = setTimeout(() => {
      initialLoadCompleteRef.current = true
      debugLog("Initial load period complete")
    }, 3000)

    // Function to play sound
    const playSound = (reason: string) => {
      // Don't play during initial load
      if (!initialLoadCompleteRef.current) {
        debugLog("Skipping sound during initial load period:", reason)
        return
      }

      // Only play after user interaction
      if (!userHasInteractedRef.current) {
        debugLog("Skipping sound before user interaction:", reason)
        return
      }

      // Debounce sound playback
      const now = Date.now()
      if (now - lastPlayTimeRef.current < 300) {
        debugLog("Debouncing sound playback:", reason)
        return
      }

      if (audioRef.current && !isPlayingRef.current) {
        isPlayingRef.current = true
        lastPlayTimeRef.current = now

        debugLog("Playing sound for:", reason)

        // Reset audio to beginning
        audioRef.current.currentTime = 0

        // Play sound
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              debugLog("Sound played successfully")
              setTimeout(() => {
                isPlayingRef.current = false
              }, 100)
            })
            .catch((error) => {
              console.error("Audio playback error:", error)
              isPlayingRef.current = false
            })
        }
      }
    }

    // Mark user interaction
    const handleUserInteraction = () => {
      if (!userHasInteractedRef.current) {
        userHasInteractedRef.current = true
        debugLog("User interaction detected")
      }
    }

    // Handle section clicks
    const handleSectionClick = (e: MouseEvent) => {
      handleUserInteraction()

      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')

      if (link) {
        debugLog("Section link clicked:", link.getAttribute("href"))
        playSound("section-click")
      }
    }

    // Handle scroll events
    const handleScroll = () => {
      handleUserInteraction()
    }

    // Handle section visibility changes
    const handleSectionInView = (e: CustomEvent) => {
      if (!e.detail?.id) return

      const currentSection = e.detail.id

      // Only play for new sections
      if (currentSection !== lastSectionRef.current) {
        debugLog(`New section in view: ${currentSection} (previous: ${lastSectionRef.current})`)
        lastSectionRef.current = currentSection

        // Play sound for section change
        playSound("section-change")
      }
    }

    // Add event listeners
    document.addEventListener("click", handleSectionClick)
    document.addEventListener("touchstart", handleUserInteraction)
    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("sectionInView", handleSectionInView as EventListener)

    // Cleanup
    return () => {
      clearTimeout(initialLoadTimer)
      document.removeEventListener("click", handleSectionClick)
      document.removeEventListener("touchstart", handleUserInteraction)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("sectionInView", handleSectionInView as EventListener)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return null
}
