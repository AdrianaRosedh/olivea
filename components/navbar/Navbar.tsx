"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import MobileDrawer from "@/components/navbar/MobileDrawer"
import MenuToggle from "@/components/navbar/MenuToggle"
import { MobileNav } from "@/components/navbar/MobileNav"
import MagneticButton from "@/components/ui/MagneticButton"
import { default as OliveaFTTLogo } from "@/assets/OliveaFTTIcon.svg"
import { useReservation } from "@/contexts/ReservationContext"

interface NavbarProps {
  lang: "en" | "es"
}

export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { openReservationModal } = useReservation()

  const handleReservationClick = () => {
    console.log("Opening reservation modal")
    openReservationModal()
  }

  const basePath = `/${lang}`
  const navItems = [
    {
      base: "casa",
      label: pathname.startsWith(`${basePath}/casa`) ? "Casa Olivea" : "Hotel",
      href: `${basePath}/casa`,
    },
    {
      base: "restaurant",
      label: pathname.startsWith(`${basePath}/restaurant`) ? "Olivea Farm To Table" : "Restaurant",
      href: `${basePath}/restaurant`,
    },
    {
      base: "cafe",
      label: pathname.startsWith(`${basePath}/cafe`) ? "Olivea Café" : "Café",
      href: `${basePath}/cafe`,
    },
  ]

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="w-full fixed top-0 z-40 bg-transparent backdrop-blur-md">
        <div className="w-full flex justify-center">
          <div className="max-w-screen-2xl w-full flex items-center justify-between px-4 md:px-8 lg:px-6 h-20 md:h-24 lg:h-28">
            {/* Left: Logo */}
            <div className="flex-1 flex items-center justify-start">
              <Link href={`/${lang}`} aria-label="Home">
                <OliveaFTTLogo className="h-10 md:h-16 lg:h-20 text-[var(--olivea-olive)]" aria-label="Olivea Logo" />
              </Link>
            </div>

            {/* Center: Nav Buttons */}
            <div className="hidden md:flex flex-1 justify-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-6 py-2.5 h-[52px] min-w-[190px] whitespace-nowrap",
                    "rounded-md border border-[var(--olivea-olive)] text-[var(--olivea-olive)] font-medium text-base uppercase transition-colors flex items-center justify-center",
                    "font-sans tracking-wide",
                    pathname === item.href
                      ? "bg-[var(--olivea-olive)] text-white"
                      : "hover:bg-[var(--olivea-olive)] hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right: Reservar Button */}
            <div className="hidden md:flex flex-1 justify-end items-center">
              <MagneticButton
                onClick={handleReservationClick}
                className="bg-[var(--olivea-olive)] text-white px-6 py-2.5 h-[60px] rounded-md hover:bg-[var(--olivea-clay)] transition-colors font-sans"
              >
                Reservar
              </MagneticButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Hamburger Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-[1000] pointer-events-auto">
        <MenuToggle toggle={() => (navigator.vibrate?.(10), setDrawerOpen((prev) => !prev))} isOpen={drawerOpen} />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} lang={lang} />

      {/* Mobile Bottom Nav */}
      <MobileNav lang={lang} isDrawerOpen={drawerOpen} />
    </>
  )
}
