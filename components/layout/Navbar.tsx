// components/layout/Navbar.tsx
"use client"

import Link            from "next/link"
import { usePathname } from "next/navigation"
import { useState, useCallback, MouseEvent, useRef } from "react"
import OliveaFTTLogo   from "@/assets/OliveaFTTIcon.svg"
import MagneticButton  from "@/components/ui/MagneticButton"
import { useReservation } from "@/contexts/ReservationContext"
import { useIsMobile }    from "@/hooks/useMediaQuery"
import { useBackgroundColorDetection } from "@/hooks/useBackgroundColorDetection"
import AdaptiveNavbar from "@/components/navigation/AdaptiveNavbar"
import MobileDrawer   from "@/components/navigation/MobileDrawer"
import { MobileNav }  from "@/components/navigation/MobileNav"

// CenterLink for desktop
interface CenterLinkProps {
  href: string
  label: string
  isActive: boolean
}
function CenterLink({ href, label, isActive }: CenterLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return
    const { left, width } = ref.current.getBoundingClientRect()
    ref.current.style.setProperty(
      "--hover-x",
      Math.round(((e.clientX - left) / width) * 100) + "%"
    )
  }
  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={onMouseMove}
      className={`relative px-6 py-2.5 h-[52px] min-w-[190px]
        whitespace-nowrap rounded-md flex items-center justify-center
        font-medium text-base uppercase font-sans tracking-wide
        ${isActive ? "active" : ""}`}
    >
      {label}
    </Link>
  )
}

interface NavbarProps {
  lang: "en" | "es"
}
export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { isDark } = useBackgroundColorDetection(200)
  const { openReservationModal } = useReservation()
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  if (isMobile) {
    return (
      <>
        <AdaptiveNavbar
          lang={lang}
          isDrawerOpen={drawerOpen}
          onToggleDrawer={toggleDrawer}
        />

        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          lang={lang}
        />

        <MobileNav lang={lang} isDrawerOpen={drawerOpen} />
      </>
    )
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-[50] bg-transparent backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 md:px-8 lg:px-6 h-20 md:h-24 lg:h-28">
        <Link href={`/${lang}`} aria-label="Home">
          <OliveaFTTLogo className="h-10 md:h-16 lg:h-20 text-[var(--olivea-olive)] cursor-pointer" />
        </Link>
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