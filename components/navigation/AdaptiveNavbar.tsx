// components/navigation/AdaptiveNavbar.tsx
"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBackgroundColorDetection } from "@/hooks/useBackgroundColorDetection"
import { useIsMobile } from "@/hooks/useMediaQuery"
import OliveaFTTLogo from "@/assets/OliveaFTTIcon.svg"
import MenuToggle    from "./MenuToggle"
import { cn }        from "@/lib/utils"

interface AdaptiveNavbarProps {
  /** ← add this! */
  lang: "en" | "es"
  isDrawerOpen: boolean
  onToggleDrawer: () => void
}

export default function AdaptiveNavbar({
  lang,
  isDrawerOpen,
  onToggleDrawer,
}: AdaptiveNavbarProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { isDark, elementRef } = useBackgroundColorDetection(300)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    handler()
    return () => window.removeEventListener("scroll", handler)
  }, [])

  if (!isMobile) return null

  const logoColor = isDrawerOpen
    ? "text-white"
    : isDark
    ? "text-[#f8f8f8]"
    : "text-[var(--olivea-olive)]"

  return (
    <div
      ref={elementRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-300",
        isScrolled ? "bg-transparent" : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between px-4 h-16">
        {/* now TS knows `lang` is OK */}
        <Link href={`/${lang}`} aria-label="Home">
          <OliveaFTTLogo className={cn("h-6 w-auto", logoColor)} />
        </Link>
        <MenuToggle
          toggle={onToggleDrawer}
          isOpen={isDrawerOpen}
          className={logoColor}
        />
      </div>
    </div>
  )
}