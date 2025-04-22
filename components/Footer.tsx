"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { AnimatePresence, motion } from "framer-motion"
import { GlobeIcon } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  const lang = pathname.split("/")[1] as "en" | "es"
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const switchLocale = (newLang: "en" | "es") => {
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/") || "/"
    Cookies.set("NEXT_LOCALE", newLang)
    router.push(newPath)
    setOpen(false)
  }

  return (
    <footer className="hidden md:flex fixed bottom-0 left-0 w-full z-40 bg-[rgba(252,250,247,0.75)] backdrop-blur-md border-t border-[rgba(44,44,44,0.08)] text-[13px] text-olivea-ink font-light tracking-wide">
      <div className="max-w-screen-2xl w-full mx-auto px-4 md:px-8 lg:px-6 py-2 flex justify-between items-center">
        <span className="text-[13px] font-light tracking-wider">
          © {new Date().getFullYear()} Inmobilaria MYA by DH
        </span>

        <div className="flex items-center gap-6 relative" ref={dropdownRef}>
          <Link
            href={`/${lang}/legal`}
            className="transition-opacity opacity-80 hover:opacity-100"
          >
            Legal
          </Link>

          {/* Globe dropdown toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs font-medium border border-gray-300 px-2 py-1.5 rounded-md bg-[rgba(252,250,247,0.75)] backdrop-blur border border-gray-300 hover:bg-gray-100 transition-all"
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
                className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-32"
              >
                <button
                  onClick={() => switchLocale("en")}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100"
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => switchLocale("es")}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100"
                >
                  🇲🇽 Español
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </footer>
  )
}