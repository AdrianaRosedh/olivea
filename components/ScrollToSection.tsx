"use client"

import { useEffect, useTransition, useState, useCallback } from "react"

export default function ScrollToSection() {
  // Use React 19's useTransition for smoother UI during scrolling
  const [isPending, startTransition] = useTransition()
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Memoized scroll function with useCallback
  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (!section) return

    // Find the scroll container
    const scrollContainer = document.querySelector(".scroll-container")
    if (!scrollContainer) return

    // Start transition for smoother UI updates
    startTransition(() => {
      // Set active section for UI updates
      setActiveSection(sectionId)

      // Use the new View Transitions API if available
      if ("startViewTransition" in document && typeof (document as any).startViewTransition === "function") {
        ;(document as any).startViewTransition(() => {
          // Calculate the top position of the section
          const sectionTop = section.offsetTop

          // Scroll the container with improved animation
          scrollContainer.scrollTo({
            top: sectionTop,
            behavior: "smooth",
          })
        })
      } else {
        // Fallback for browsers without View Transitions API
        const sectionTop = section.offsetTop
        scrollContainer.scrollTo({
          top: sectionTop,
          behavior: "smooth",
        })
      }
    })
  }, [])

  // Handle initial hash in URL
  useEffect(() => {
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1)
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => scrollToSection(sectionId), 100)
      return () => clearTimeout(timer) // Proper cleanup in React 19
    }
  }, [scrollToSection])

  // Add click event listeners to all section navigation links
  useEffect(() => {
    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')

      if (link) {
        e.preventDefault()
        const sectionId = link.getAttribute("href")?.substring(1)
        if (sectionId) {
          scrollToSection(sectionId)

          // Provide haptic feedback if available
          if (window.navigator.vibrate) {
            window.navigator.vibrate(10)
          }

          // Update URL without reload
          window.history.pushState(null, "", `#${sectionId}`)
        }
      }
    }

    document.addEventListener("click", handleNavClick)
    return () => document.removeEventListener("click", handleNavClick)
  }, [scrollToSection])

  // This component doesn't render anything
  return null
}
