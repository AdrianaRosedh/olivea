"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, GlobeIcon } from "lucide-react"
import MobileDrawer from "@/components/navbar/MobileDrawer"
import MenuToggle from "@/components/navbar/MenuToggle"

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
    <nav className="w-full border-b sticky top-0 z-50 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 relative flex items-center justify-between">
        {/* Centered Logo */}
        <Link
          href={`/${lang}`}
          className="text-2xl md:text-4xl font-bold absolute left-1/2 transform -translate-x-1/2"
        >
          Olivea
        </Link>

        {/* Right: Hamburger Toggle */}
        <div className="md:hidden absolute right-4 top-4 z-[60]">
          <MenuToggle toggle={() => setDrawerOpen((prev) => !prev)} isOpen={drawerOpen} />
        </div>

        {/* Locale Selector (desktop only) */}
        <div className="hidden md:block relative ml-auto" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 border rounded px-3 py-2 text-sm hover:bg-gray-100"
          >
            <GlobeIcon className="w-4 h-4" />
            {lang.toUpperCase()}
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 mt-2 bg-white border rounded shadow-md z-50 w-32"
              >
                <button onClick={() => switchLocale("en")} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
                  🇺🇸 English
                </button>
                <button onClick={() => switchLocale("es")} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100">
                  🇲🇽 Español
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex justify-center gap-8 mt-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-lg font-medium transition hover:underline",
              pathname === item.href && "text-black"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} lang={lang} />
    </nav>
  )
}
