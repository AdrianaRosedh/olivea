"use client"

import { useState, useEffect } from "react"

export default function ScrollDebugger() {
  const [debugInfo, setDebugInfo] = useState({
    scrollY: 0,
    scrollHeight: 0,
    clientHeight: 0,
    percentage: 0,
    sections: [] as string[],
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to update debug info
    const updateDebugInfo = () => {
      const scrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const percentage = Math.min(100, Math.round((scrollY / maxScroll) * 100))

      // Find visible sections
      const sections = Array.from(document.querySelectorAll("section[id]"))
      const visibleSections = sections
        .filter((section) => {
          const rect = section.getBoundingClientRect()
          return rect.top < clientHeight && rect.bottom > 0
        })
        .map((section) => section.id)

      setDebugInfo({
        scrollY,
        scrollHeight,
        clientHeight,
        percentage,
        sections: visibleSections,
      })
    }

    // Update immediately
    updateDebugInfo()

    // Add scroll event listener
    window.addEventListener("scroll", updateDebugInfo, { passive: true })

    // Force update after a short delay
    const timer = setTimeout(updateDebugInfo, 200)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", updateDebugInfo)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-[1000] bg-black/80 text-white p-3 text-xs font-mono rounded-md max-w-[300px] overflow-auto">
      <div>
        <strong>scrollY:</strong> {debugInfo.scrollY}
      </div>
      <div>
        <strong>scrollHeight:</strong> {debugInfo.scrollHeight}
      </div>
      <div>
        <strong>clientHeight:</strong> {debugInfo.clientHeight}
      </div>
      <div>
        <strong>percentage:</strong> {debugInfo.percentage}%
      </div>
      <div>
        <strong>visible sections:</strong> {debugInfo.sections.join(", ") || "none"}
      </div>
    </div>
  )
}
