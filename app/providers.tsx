"use client"

import { ThemeProvider } from "next-themes"
import { useState, useEffect, type ReactNode } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export function Providers({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking if fonts are loaded
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-[var(--olivea-cream)]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        children
      )}
    </ThemeProvider>
  )
}
