"use client"

import { useEffect, useRef, useState } from "react"

export default function MobileAudioFeedback() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(false)
  const lastPlayTimeRef = useRef(0)
  const lastSectionRef = useRef<string | null>(null)
  const initialLoadCompleteRef = useRef(false)
  const userHasInteractedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Initialize audio
    audioRef.current = new Audio("/sounds/scroll-click.mp3")
    audioRef.current.volume = 0.3
    audioRef.current.preload = "auto"
    try { audioRef.current.load() } catch (err) { console.error(err) }
    const initialLoadTimer = setTimeout(() => {
      initialLoadCompleteRef.current = true
    }, 1000)

    const playSound = () => {
      if (!initialLoadCompleteRef.current) return
      if (!userHasInteractedRef.current) return

      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      const debounceTime = isMobileDevice ? 100 : 300
      const now = Date.now()
      if (now - lastPlayTimeRef.current < debounceTime) return

      const audio = audioRef.current
      if (audio && !isPlayingRef.current) {
        isPlayingRef.current = true
        lastPlayTimeRef.current = now
        audio.currentTime = 0
        const playPromise = audio.play()
        if (playPromise) {
          playPromise
            .catch(console.error)
            .finally(() => setTimeout(() => { isPlayingRef.current = false }, isMobileDevice ? 50 : 100))
        }
      }
    }

    const handleUserInteraction = () => {
      userHasInteractedRef.current = true
    }

    // Update active section based on visibility
    const updateActiveSection = () => {
      // Gather all sections as HTMLElements
      const sections: HTMLElement[] = Array.from(
        document.querySelectorAll<HTMLElement>("section[id]")
      );
      if (sections.length === 0) return;

      let bestSection: HTMLElement | null = null;
      let bestVisibility = 0;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much of the section is visible
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibility = visibleHeight / rect.height;

        // Weight the center of the screen more heavily
        const distanceFromCenter = Math.abs((rect.top + rect.bottom) / 2 - windowHeight / 2);
        const centerWeight = 1 - Math.min(1, distanceFromCenter / (windowHeight / 2));

        // Combined score that favors both visibility and centeredness
        const score = visibility * 0.7 + centerWeight * 0.3;

        if (score > bestVisibility) {
          bestVisibility = score;
          bestSection = section;
        }
      }

      if (bestSection && bestSection.id !== activeSection) {
        setActiveSection(bestSection.id);

        // Only play sound if this is a new section (not initial load)
        // and user has interacted with the page
        if (
          lastSectionRef.current !== null &&
          bestSection.id !== lastSectionRef.current &&
          userHasInteractedRef.current
        ) {
          // Force vibration for better feedback
          if (window.navigator.vibrate) {
            window.navigator.vibrate(10);
          }

          // On mobile, we need to be more aggressive about playing sounds
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
          if (isMobileDevice) {
            // For mobile, play sound with minimal debounce
            const now = Date.now();
            if (now - lastPlayTimeRef.current > 100) {
              // Shorter debounce for mobile
              lastPlayTimeRef.current = now;
              playSound();
            }
          } else {
            playSound();
          }
        }

        lastSectionRef.current = bestSection.id;
      }
    };

    // Throttled scroll handler
    let scrollTimeout: number | null = null
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      const throttleTime = isMobileDevice ? 30 : 50
      scrollTimeout = window.setTimeout(() => {
        updateActiveSection()
        scrollTimeout = null
      }, throttleTime)
    }

    // Event listeners
    document.addEventListener("touchstart", handleUserInteraction, { passive: true })
    document.addEventListener("click", () => { handleUserInteraction(); playSound() })
    window.addEventListener("scroll", handleScroll, { passive: true })
    const container = document.querySelector<HTMLElement>(".scroll-container")
    if (container) container.addEventListener("scroll", handleScroll, { passive: true })

    updateActiveSection()

    // Cleanup
    return () => {
      clearTimeout(initialLoadTimer)
      document.removeEventListener("touchstart", handleUserInteraction)
      window.removeEventListener("scroll", handleScroll)
      if (container) container.removeEventListener("scroll", handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [activeSection])

  return null
}
