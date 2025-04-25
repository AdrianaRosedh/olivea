"use client"

import { useEffect } from "react"

export default function ScrollToSection() {
  // Handle hash navigation and section scrolling
  useEffect(() => {
    // Function to handle scrolling to a section
    const scrollToSection = (sectionId: string) => {
      const section = document.getElementById(sectionId)
      if (!section) return

      // Find the scroll container
      const scrollContainer = document.querySelector(".scroll-container")
      if (!scrollContainer) return

      // Calculate the top position of the section
      const sectionTop = section.offsetTop

      // Scroll the container
      scrollContainer.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      })
    }

    // Handle initial hash in URL
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1)
      setTimeout(() => scrollToSection(sectionId), 100)
    }

    // Add click event listeners to all section navigation links
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
        }
      }
    }

    document.addEventListener("click", handleNavClick)

    return () => {
      document.removeEventListener("click", handleNavClick)
    }
  }, [])

  // This component doesn't render anything
  return null
}
