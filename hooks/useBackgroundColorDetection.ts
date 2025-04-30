"use client"

import { useState, useEffect, useRef } from "react"

export function useBackgroundColorDetection(interval = 500) {
  const [isDark, setIsDark] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate luminance from RGB values (0-255)
  const calculateLuminance = (r: number, g: number, b: number) => {
    // Convert RGB to relative luminance using the formula for perceived brightness
    // https://www.w3.org/TR/WCAG20-TECHS/G18.html
    const a = [r, g, b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }

  // Check if background is dark
  const checkBackground = () => {
    if (!elementRef.current || typeof window === "undefined") return

    try {
      const rect = elementRef.current.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2

      // Fallback: Check elements at position
      const elements = document.elementsFromPoint(x, y)

      // Skip the first element (which is our navbar)
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]

        // Skip our own element and any transparent elements
        if (element === elementRef.current) continue

        const bgColor = window.getComputedStyle(element).backgroundColor

        // Skip transparent backgrounds
        if (bgColor === "rgba(0, 0, 0, 0)" || bgColor === "transparent") continue

        // Parse RGB values
        const rgbMatch = bgColor.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?$$/)

        if (rgbMatch) {
          const r = Number.parseInt(rgbMatch[1], 10)
          const g = Number.parseInt(rgbMatch[2], 10)
          const b = Number.parseInt(rgbMatch[3], 10)

          const luminance = calculateLuminance(r, g, b)
          setIsDark(luminance < 0.5)
          return
        }
      }

      // If we get here, we couldn't find a non-transparent background
      // Check if there's a background image
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        if (element === elementRef.current) continue

        const bgImage = window.getComputedStyle(element).backgroundImage
        if (bgImage && bgImage !== "none") {
          // If there's a background image, assume it's dark (most common case)
          setIsDark(true)
          return
        }
      }

      // Default to light if we can't determine
      setIsDark(false)
    } catch (error) {
      console.error("Error checking background:", error)
      // Default to light if there's an error
      setIsDark(false)
    }
  }

  useEffect(() => {
    // Initial check
    setTimeout(checkBackground, 100)

    // Set up interval for checking
    checkIntervalRef.current = setInterval(checkBackground, interval)

    // Also check on scroll
    const handleScroll = () => {
      requestAnimationFrame(checkBackground)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Clean up
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      window.removeEventListener("scroll", handleScroll)
    }
  }, [interval])

  return { isDark, elementRef }
}
