"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import MobileDrawer from "@/components/navbar/MobileDrawer"
import MenuToggle from "@/components/navbar/MenuToggle"
import { MobileNav } from "@/components/navbar/MobileNav"
import MagneticButton from "@/components/ui/MagneticButton"
import OliveaLogo from "@/assets/OliveaFTTIcon.svg"

interface NavbarProps {
  lang: "en" | "es"
}

export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

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
      <nav className="w-full sticky top-0 z-50 bg-transparent backdrop-blur-md">
        <div className="w-full flex justify-center">
          <div className="max-w-screen-2xl w-full flex items-center justify-between px-4 md:px-8 lg:px-6 h-20 md:h-32 lg:h-36">

            {/* Left: Logo */}
            <div className="flex-1 flex items-center justify-start">
              <Link href={`/${lang}`} aria-label="Home">
              <OliveaLogo className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 text-[var(--olivea-soil)]" />
              </Link>
            </div>

            {/* Center: Nav Buttons */}
            <div className="hidden md:flex flex-1 justify-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-5 py-2 rounded-md border border-[var(--olivea-soil)] text-[var(--olivea-soil)] font-medium text-sm tracking-wide uppercase transition-colors",
                    pathname === item.href
                      ? "bg-[var(--olivea-soil)] text-white"
                      : "hover:bg-[var(--olivea-soil)] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right: Reservar Button */}
            <div className="hidden md:flex flex-1 justify-end items-center">
              <MagneticButton
                href={`/${lang}/reservations`}
                className="bg-[var(--olivea-soil)] text-white px-6 py-2.5 rounded-md hover:bg-[var(--olivea-olive)] transition-colors"
              >
                Reservar
              </MagneticButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Hamburger Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-[1000]">
        <MenuToggle toggle={() => setDrawerOpen((prev) => !prev)} isOpen={drawerOpen} />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} lang={lang} />

      {/* Mobile Bottom Nav */}
      <MobileNav lang={lang} isDrawerOpen={drawerOpen} />
    </>
  )
}