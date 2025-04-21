"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, GlobeIcon } from "lucide-react"

type NavbarProps = {
  lang: "en" | "es"
}

export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [open, setOpen] = useState(false)

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
      <div className="max-w-6xl mx-auto px-4 py-4 relative flex flex-col items-center">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "flex items-center gap-1 border rounded transition hover:bg-gray-100 px-3 py-2 text-sm",
              "md:text-sm md:px-3 md:py-2 text-xs px-2 py-1"
            )}
          >
            <GlobeIcon className="w-4 h-4" />
            {lang.toUpperCase()}
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
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
                <button
                  onClick={() => switchLocale("en")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => switchLocale("es")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  🇲🇽 Español
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo */}
        <Link
          href={`/${lang}`}
          className="text-2xl md:text-4xl font-bold block text-center"
        >
          Olivea
        </Link>

        {/* Mobile nav */}
        <div className="flex justify-around mt-4 md:hidden w-full">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition hover:underline",
                pathname === item.href && "text-black"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex justify-center gap-8 mt-4">
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
      </div>
    </nav>
  )
}