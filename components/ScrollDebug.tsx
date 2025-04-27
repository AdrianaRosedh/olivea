"use client"

import React from "react"

import { useEffect, useRef } from "react"

export default function ScrollDebug() {
  const debugRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const debugElement = debugRef.current
    if (!debugElement) return

    // Function to update debug info
    const updateDebugInfo = () => {
      const scrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const percentage = Math.min(100, Math.round((scrollY / maxScroll) * 100))

      // Get React version
      const reactVersion = React?.version || "unknown"

      // Update debug info
      debugElement.innerHTML = `
        <div><strong>React:</strong> ${reactVersion}</div>
        <div><strong>scrollY:</strong> ${scrollY}</div>
        <div><strong>scrollHeight:</strong> ${scrollHeight}</div>
        <div><strong>clientHeight:</strong> ${clientHeight}</div>
        <div><strong>percentage:</strong> ${percentage}%</div>
        <div><strong>timestamp:</strong> ${new Date().toISOString().substr(11, 8)}</div>
      `
    }

    // Update immediately
    updateDebugInfo()

    // Use passive event listener for better performance
    window.addEventListener("scroll", updateDebugInfo, { passive: true })

    // Update periodically to ensure it's working
    const interval = setInterval(updateDebugInfo, 1000)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", updateDebugInfo)
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      ref={debugRef}
      className="fixed bottom-2 right-2 z-[9999] bg-black/70 text-white p-2 text-xs font-mono rounded max-w-[300px] overflow-auto"
    >
      Loading debug info...
    </div>
  )
}
