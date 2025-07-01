"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { AnimatePresence, motion } from "framer-motion"
import { GlobeIcon } from "lucide-react"
import { FaYoutube, FaInstagram, FaTiktok, FaLinkedin, FaSpotify, FaPinterest } from "react-icons/fa";


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
    Cookies.set("NEXT_LOCALE", newLang, { path: "/" })
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/") || `/${newLang}`
    router.push(newPath)
    setOpen(false)
  }

  return (
    <footer className="hidden md:flex fixed bottom-0 left-0 w-full z-[50] bg-transparent backdrop-blur-md text-[13px] text-[var(--olivea-ink)] font-light tracking-wide">
      <div className="max-w-screen-2xl w-full mx-auto px-4 md:px-2 lg:px-0 py-2 flex justify-between items-center">
        <div className="flex-1">
          <span className="cursor-default transition-colors hover:text-[var(--olivea-clay)]">
            © {new Date().getFullYear()} Familia Olivea
          </span>
        </div>

        <div className="flex-1 flex justify-center items-center gap-4">
          <a href="#" aria-label="YouTube" className="text-[var(--olivea-olive)] opacity-70 hover:opacity-100 transition-opacity">
            <FaYoutube size={20} />
          </a>
          <a href="#" aria-label="Instagram" className="text-[var(--olivea-olive)] opacity-70 hover:opacity-100 transition-opacity">
            <FaInstagram size={20} />
          </a>
          <a href="#" aria-label="TikTok" className="text-[var(--olivea-olive)] opacity-70 hover:opacity-100 transition-opacity">
            <FaTiktok size={20} />
          </a>
          <a href="#" aria-label="LinkedIn" className="text-[var(--olivea-olive)] opacity-70 hover:opacity-100 transition-opacity">
            <FaLinkedin size={20} />
          </a>
          <a href="#" aria-label="Spotify" className="text-[var(--olivea-olive)] opacity-70 hover:opacity-100 transition-opacity">
            <FaSpotify size={20} />
          </a>
          <a href="#" aria-label="Pinterest" className="text-[var(--olivea-olive)] opacity-70 hover:opacity-100 transition-opacity">
            <FaPinterest size={20} />
          </a>
        </div>


        <div className="flex-1 flex items-center justify-end gap-6 relative" ref={dropdownRef}>
          <Link href={`/${lang}/contact`} className="transition-colors opacity-80 hover:text-[var(--olivea-clay)] hover:opacity-100">
            Contact
          </Link>
          <Link href={`/${lang}/legal`} className="transition-colors opacity-80 hover:text-[var(--olivea-clay)] hover:opacity-100">
            Legal
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors border border-[rgba(0,0,0,0.05)] hover:bg-[var(--olivea-clay)] hover:text-white"
          >
            <GlobeIcon className="w-4 h-4 text-[var(--olivea-olive)] transition-colors" />
            {lang.toUpperCase()}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute bottom-full mb-2 right-0 bg-transparent backdrop-blur-md border border-gray-200 rounded-md shadow-lg z-50 w-32"
              >
                <button
                  onClick={() => switchLocale("en")}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--olivea-clay)] hover:text-white"
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => switchLocale("es")}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--olivea-clay)] hover:text-white"
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