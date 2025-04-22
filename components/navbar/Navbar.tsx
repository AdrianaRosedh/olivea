"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { GlobeIcon } from "lucide-react"
import MobileDrawer from "@/components/navbar/MobileDrawer"
import MenuToggle from "@/components/navbar/MenuToggle"
import { MobileNav } from "@/components/navbar/MobileNav"
import MagneticButton from "@/components/ui/MagneticButton"

interface NavbarProps {
  lang: "en" | "es"
}

export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!hasMounted) return null

  const navItems = [
    { label: "Hotel", href: `/${lang}/casa` },
    { label: "Restaurant", href: `/${lang}/restaurant` },
    { label: "Café", href: `/${lang}/cafe` },
  ]

  const switchLocale = (newLang: "en" | "es") => {
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/") || "/"
    Cookies.set("NEXT_LOCALE", newLang)
    router.push(newPath)
    setOpen(false)
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="w-full sticky top-0 z-50 bg-white">
        <div className="w-full flex justify-center">
          <div className="max-w-screen-2xl w-full flex items-center justify-between px-4 md:px-8 lg:px-6 h-20 md:h-32 lg:h-36">
            {/* Left: Logo */}
            <div className="flex-1 flex items-center justify-start">
              <Link href={`/${lang}`}>
                <img
                  src="/images/logos/OliveaFTTIcon.svg"
                  alt="Olivea Logo"
                  className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain transition-all duration-200"
                />
              </Link>
            </div>

            {/* Center: Nav Links */}
            <div className="hidden md:flex flex-1 justify-center gap-16">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-2xl font-semibold text-black hover:text-green-700 transition-transform hover:scale-105",
                    pathname === item.href && "underline underline-offset-4 decoration-2"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right: Reservar Button */}
            <div className="hidden md:flex flex-1 justify-end items-center">
              <MagneticButton href={`/${lang}/reservations`}>
                Reservar
              </MagneticButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Language Switcher */}
      <div className="hidden md:flex fixed bottom-4 left-4 z-50 flex-col items-start gap-2" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 rounded-md text-xs font-medium bg-white/70 backdrop-blur-sm shadow hover:bg-gray-100"
        >
          <GlobeIcon className="w-4 h-4" />
          {lang.toUpperCase()}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="bg-white border border-gray-200 rounded-md shadow-lg z-50 w-32"
            >
              <button onClick={() => switchLocale("en")} className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100">
                🇺🇸 English
              </button>
              <button onClick={() => switchLocale("es")} className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100">
                🇲🇽 Español
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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