"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { AnimatePresence, motion } from "framer-motion"
import { GlobeIcon, Instagram, Linkedin, Youtube, Music, PinIcon } from "lucide-react"

// Custom TikTok icon component
const TikTokIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
    <path d="M15 8c0 1.657-1.343 3-3 3v5.5a6.5 6.5 0 1 1-6.5-6.5H13V8h2z"></path>
    <path d="M15 5.5v-1A1.5 1.5 0 0 1 16.5 3H18a3 3 0 0 1 3 3v3h-2"></path>
  </svg>
)

export default function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  const lang = pathname.split("/")[1] as "en" | "es"
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isCasaPage = pathname.includes("/casa")

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
    // Set cookie first
    Cookies.set("NEXT_LOCALE", newLang, { path: "/" })

    // Create the new path
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/") || `/${newLang}`

    // Use router.push for client-side navigation
    router.push(newPath)
    setOpen(false)
  }

  return (
    <footer
      className={`hidden md:flex fixed bottom-0 left-0 w-full z-40 bg-transparent backdrop-blur-md text-[13px] text-olivea-ink font-light tracking-wide ${isCasaPage ? "pointer-events-auto" : ""}`}
    >
      <div className="max-w-screen-2xl w-full mx-auto px-4 md:px-8 lg:px-6 py-2 flex justify-between items-center">
        {/* Copyright */}
        <div className="flex-1">
          <span className="text-[13px] font-light tracking-wider">
            © {new Date().getFullYear()} Inmobilaria MYA by DH
          </span>
        </div>

        {/* Social Media Icons - Centered */}
        <div className="flex-1 flex justify-center">
          <div className="social-media flex items-center gap-3">
            <a href="#" className="social-icon-link bg-transparent backdrop-blur-sm" aria-label="YouTube">
              <Youtube size={18} className="social-icon youtube" />
            </a>
            <a href="#" className="social-icon-link bg-transparent backdrop-blur-sm" aria-label="Instagram">
              <Instagram size={18} className="social-icon instagram" />
            </a>
            <a href="#" className="social-icon-link bg-transparent backdrop-blur-sm" aria-label="TikTok">
              <TikTokIcon size={18} className="social-icon tiktok" />
            </a>
            <a href="#" className="social-icon-link bg-transparent backdrop-blur-sm" aria-label="LinkedIn">
              <Linkedin size={18} className="social-icon linkedin" />
            </a>
            <a href="#" className="social-icon-link bg-transparent backdrop-blur-sm" aria-label="Spotify">
              <Music size={18} className="social-icon spotify" />
            </a>
            <a href="#" className="social-icon-link bg-transparent backdrop-blur-sm" aria-label="Pinterest">
              <PinIcon size={18} className="social-icon pinterest" />
            </a>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex-1 flex items-center justify-end gap-6 relative" ref={dropdownRef}>
          <Link href={`/${lang}/legal`} className="transition-opacity opacity-80 hover:opacity-100">
            Legal
          </Link>

          {/* Globe dropdown toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs font-medium border border-gray-300 px-2 py-1.5 rounded-md bg-transparent backdrop-blur-sm hover:bg-gray-100/50 transition-all"
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
                className="absolute bottom-full mb-2 right-0 bg-transparent backdrop-blur-md border border-gray-200 rounded-md shadow-lg z-50 w-32"
              >
                <button
                  onClick={() => switchLocale("en")}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100/50"
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => switchLocale("es")}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100/50"
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
