// components/layout/Navbar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useCallback, MouseEvent, useRef } from "react"
import OliveaFTTLogo from "@/assets/OliveaFTTIcon.svg"
import MagneticButton from "@/components/ui/MagneticButton"
import { useReservation } from "@/contexts/ReservationContext"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { useBackgroundColorDetection } from "@/hooks/useBackgroundColorDetection"
import AdaptiveNavbar from "@/components/navigation/AdaptiveNavbar"
import MenuToggle from "@/components/navigation/MenuToggle"
import MobileDrawer from "@/components/navigation/MobileDrawer"    // ← bring this back
import { MobileNav } from "@/components/navigation/MobileNav"

interface CenterLinkProps {
  href: string
  label: string
  isActive: boolean
}

function CenterLink({ href, label, isActive }: CenterLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  function onMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    if (!ref.current) return
    const { left, width } = ref.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - left) / width) * 100)
    ref.current.style.setProperty("--hover-x", `${x}%`)
  }

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={onMouseMove}
      className={`
        relative px-6 py-2.5 h-[52px] min-w-[190px]
        whitespace-nowrap rounded-md
        flex items-center justify-center
        font-medium text-base uppercase font-sans tracking-wide
        ${isActive ? "active" : ""}
      `}
    >
      {label}
    </Link>
  )
}

export default function Navbar({ lang }: { lang: "en" | "es" }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { openReservationModal } = useReservation()
  const isMobile = useIsMobile()
  const { isDark } = useBackgroundColorDetection(200)

  const toggleDrawer = useCallback(() => {
    navigator.vibrate?.(10)
    setDrawerOpen((v) => !v)
  }, [])

  const handleReserve = useCallback(() => {
    openReservationModal()
  }, [openReservationModal])

  const base = `/${lang}`
  const navItems = [
    {
      href: `${base}/casa`,
      label: pathname.startsWith(`${base}/casa`) ? "Casa Olivea" : "Hotel",
    },
    {
      href: `${base}/restaurant`,
      label: pathname.startsWith(`${base}/restaurant`)
        ? "Olivea Farm To Table"
        : "Restaurant",
    },
    {
      href: `${base}/cafe`,
      label: pathname.startsWith(`${base}/cafe`) ? "Olivea Café" : "Café",
    },
  ]

  // ——— MOBILE ———
  if (isMobile) {
    return (
      <>
        {/* Top bar with adaptive nav styling */}
        <AdaptiveNavbar
          lang={lang}
          onToggleDrawer={toggleDrawer}
          isDrawerOpen={drawerOpen}
        />

        {/* Hamburger toggle */}
        <div className="fixed top-4 right-4 z-[1002]">
          <MenuToggle
            toggle={toggleDrawer}
            isOpen={drawerOpen}
            className={
              drawerOpen
                ? "text-white"
                : isDark
                ? "text-[#f8f8f8]"
                : "text-[var(--olivea-olive)]"
            }
          />
        </div>

        {/* ← Slide-out drawer panel */}
        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          lang={lang}
        />

        {/* Bottom tab nav */}
        <MobileNav lang={lang} isDrawerOpen={drawerOpen} />
      </>
    )
  }

  // ——— DESKTOP ———
  return (
    <nav className="fixed top-0 left-0 w-full z-[50] bg-transparent backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 md:px-8 lg:px-6 h-20 md:h-24 lg:h-28">
        {/* Logo */}
        <Link href={`/${lang}`} aria-label="Home">
          <OliveaFTTLogo className="h-10 md:h-16 lg:h-20 text-[var(--olivea-olive)] cursor-pointer" />
        </Link>

        {/* Center links */}
        <div className="flex flex-1 justify-center gap-4 fill-nav">
          {navItems.map((it) => (
            <CenterLink
              key={it.href}
              href={it.href}
              label={it.label}
              isActive={pathname === it.href}
            />
          ))}
        </div>

        {/* Reservar button */}
        <MagneticButton
          onClick={handleReserve}
          className="bg-[var(--olivea-olive)] text-white px-6 py-2.5 h-[60px] rounded-md hover:bg-[var(--olivea-clay)] transition-colors"
        >
          Reservar
        </MagneticButton>
      </div>
    </nav>
  )
}