"use client"

import { useEffect, useRef, useState } from "react"

export default function MobileAudioFeedback() {
  // Track active section
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Track state
  const isPlayingRef = useRef(false)
  const lastPlayTimeRef = useRef(0)
  const lastSectionRef = useRef<string | null>(null)
  const initialLoadCompleteRef = useRef(false)
  const userHasInteractedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Create audio element immediately but don't play it
    audioRef.current = new Audio("/sounds/scroll-click.mp3")
    audioRef.current.volume = 0.3
    audioRef.current.preload = "auto"

    try {
      audioRef.current.load()
    } catch (err) {
      console.error("Error loading audio:", err)
    }

    // After 1 second, mark initial load as complete
    const initialLoadTimer = setTimeout(() => {
      initialLoadCompleteRef.current = true
    }, 1000)

    // Function to play sound
    const playSound = () => {
      // Don't play during initial load
      if (!initialLoadCompleteRef.current) return

      // Only play after user interaction
      if (!userHasInteractedRef.current) return

      // Check if we're on a mobile device
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      // Use a shorter debounce time on mobile devices
      const debounceTime = isMobileDevice ? 100 : 300

      // Debounce sound playback
      const now = Date.now()
      if (now - lastPlayTimeRef.current < debounceTime) return

      if (audioRef.current && !isPlayingRef.current) {
        isPlayingRef.current = true
        lastPlayTimeRef.current = now

        // Reset audio to beginning
        audioRef.current.currentTime = 0

        // On mobile, we need to use a user interaction to play audio
        if (isMobileDevice) {
          // Try to play with a user gesture simulation
          const playPromise = audioRef.current.play()

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setTimeout(() => {
                  isPlayingRef.current = false
                }, 50) // Very short reset time on mobile
              })
              .catch((error) => {
                console.error("Audio playback error:", error)
                isPlayingRef.current = false

                // Try to play again with a different approach
                document.addEventListener(
                  "touchend",
                  function playOnTouch() {
                    audioRef.current?.play()
                    document.removeEventListener("touchend", playOnTouch)
                  },
                  { once: true },
                )
              })
          }
        } else {
          // Desktop behavior
          const playPromise = audioRef.current.play()

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
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
    }

    // Mark user interaction
    const handleUserInteraction = () => {
      userHasInteractedRef.current = true
    }

    // Function to determine which section is active
    const updateActiveSection = () => {
      const sections = document.querySelectorAll("section[id]")
      if (sections.length === 0) return

      let bestSection = null
      let bestVisibility = 0

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Calculate how much of the section is visible
        const visibleTop = Math.max(0, rect.top)
        const visibleBottom = Math.min(windowHeight, rect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const visibility = visibleHeight / rect.height

        // Weight the center of the screen more heavily
        const distanceFromCenter = Math.abs((rect.top + rect.bottom) / 2 - windowHeight / 2)
        const centerWeight = 1 - Math.min(1, distanceFromCenter / (windowHeight / 2))

        // Combined score that favors both visibility and centeredness
        const score = visibility * 0.7 + centerWeight * 0.3

        if (score > bestVisibility) {
          bestVisibility = score
          bestSection = section
        }
      })

      if (bestSection && bestSection.id !== activeSection) {
        setActiveSection(bestSection.id)

        // Only play sound if this is a new section (not initial load)
        // and user has interacted with the page
        if (
          lastSectionRef.current !== null &&
          bestSection.id !== lastSectionRef.current &&
          userHasInteractedRef.current
        ) {
          // Force vibration for better feedback
          if (window.navigator.vibrate) {
            window.navigator.vibrate(10)
          }

          // On mobile, we need to be more aggressive about playing sounds
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          )
          if (isMobileDevice) {
            // For mobile, play sound with minimal debounce
            const now = Date.now()
            if (now - lastPlayTimeRef.current > 100) {
              // Shorter debounce for mobile
              lastPlayTimeRef.current = now
              playSound()
            }
          } else {
            playSound()
          }
        }

        lastSectionRef.current = bestSection.id
      }
    }

    // Throttled scroll handler
    let scrollTimeout: NodeJS.Timeout | null = null
    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      // Check if we're on a mobile device
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      // Use a shorter throttle time for mobile
      const throttleTime = isMobileDevice ? 30 : 50

      // Throttle section updates
      scrollTimeout = setTimeout(() => {
        updateActiveSection()
        scrollTimeout = null
      }, throttleTime)
    }

    // Handle section clicks
    const handleSectionClick = (e: MouseEvent) => {
      handleUserInteraction()

      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')

      if (link) {
        playSound()
      }
    }

    // Add event listeners
    document.addEventListener("click", handleSectionClick)
    document.addEventListener("touchstart", handleUserInteraction, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    const scrollContainer = document.querySelector(".scroll-container")
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    }

    // Remove the complex event listener for sectionInView events
    // and rely on the scroll detection instead
    const handleSectionInViewEvent = () => {}

    // Initial update
    updateActiveSection()

    // Cleanup
    return () => {
      clearTimeout(initialLoadTimer)
      document.removeEventListener("click", handleSectionClick)
      document.removeEventListener("touchstart", handleUserInteraction)
      window.removeEventListener("scroll", handleScroll)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      document.removeEventListener("sectionInView", handleSectionInViewEvent as EventListener)
    }
  }, [activeSection])

  return null
}
