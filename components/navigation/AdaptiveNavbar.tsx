"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBackgroundColorDetection } from "@/hooks/useBackgroundColorDetection"
import { useIsMobile } from "@/hooks/useMediaQuery"
import OliveaFTTLogo  from "@/assets/OliveaFTTIcon.svg"
import { cn } from "@/lib/utils"

interface AdaptiveNavbarProps {
  lang: "en" | "es"
  onToggleDrawer: () => void
  isDrawerOpen: boolean
}

export default function AdaptiveNavbar({ lang, onToggleDrawer, isDrawerOpen }: AdaptiveNavbarProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { isDark, elementRef } = useBackgroundColorDetection(300)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll position
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Only render on mobile
  if (!isMobile) return null

  // Determine text color based on background
  // When drawer is open, always use white color for better visibility
  // When dark background is detected, use almost white (#f8f8f8)
  const logoColor = isDrawerOpen ? "text-white" : isDark ? "text-[#f8f8f8]" : "text-[var(--olivea-olive)]"

  return (
    <div
      ref={elementRef}
      className={cn(
        "fixed top-0 left-0 w-full z-40 transition-all duration-300",
        isScrolled ? "bg-transparent" : "bg-transparent",
      )}
    >
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href={`/${lang}`} aria-label="Home">
            <OliveaFTTLogo className={cn("h-6 w-auto", logoColor)} />
        </Link>
      </div>
    </div>
  )
}
