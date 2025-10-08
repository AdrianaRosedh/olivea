"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import Cookies from "js-cookie"
import { AnimatePresence, motion } from "framer-motion"
import { GlobeIcon } from "lucide-react"
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaSpotify,
  FaPinterest,
} from "react-icons/fa"
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries"

interface FooterProps {
  dict: AppDictionary
}

type SocialItem = {
  id: string
  href: string
  label: string
  icon: ReactNode
}

export default function Footer({ dict }: FooterProps) {
  const pathname = usePathname()
  const router = useRouter()
  const lang = (pathname.split("/")[1] as "en" | "es") || "es"
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const switchLocale = (newLang: "en" | "es") => {
    Cookies.set("NEXT_LOCALE", newLang, { path: "/" })
    const segments = pathname.split("/")
    segments[1] = newLang
    const newPath = segments.join("/") || `/${newLang}`
    router.push(newPath)
    setOpen(false)
  }

  const rightsText =
    lang === "en" ? "All rights reserved." : "Todos los derechos reservados."

  const socialItems: SocialItem[] = [
    { id: "yt", href: "https://www.youtube.com/@GrupoOlivea", label: "YouTube", icon: <FaYoutube /> },
    { id: "ig", href: "https://instagram.com/oliveafarmtotable/", label: "Instagram", icon: <FaInstagram /> },
    { id: "tt", href: "https://www.tiktok.com/@familiaolivea", label: "TikTok", icon: <FaTiktok /> },
    { id: "li", href: "https://www.linkedin.com/company/inmobiliaria-casa-olivea/", label: "LinkedIn", icon: <FaLinkedin /> },
    { id: "sp", href: "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8", label: "Spotify", icon: <FaSpotify /> },
    { id: "pt", href: "https://mx.pinterest.com/familiaolivea/", label: "Pinterest", icon: <FaPinterest /> },
  ]

  return (
    <footer className="hidden md:flex fixed bottom-0 left-0 w-full z-[80] bg-transparent backdrop-blur-md text-[12px] text-[var(--olivea-ink)] font-light tracking-wide">
      <div className="w-full flex justify-between items-center px-2 sm:px-3 py-2">
        {/* Left */}
        <div className="flex-1 whitespace-nowrap">
          <span className="cursor-default transition-colors hover:text-[var(--olivea-clay)]">
            © {new Date().getFullYear()} Casa Olivea AC. {rightsText}
          </span>
        </div>

        {/* Center: Social Dock */}
        <FooterSocialDock items={socialItems} />

        {/* Right */}
        <div className="flex-1 flex items-center justify-end gap-4 relative" ref={dropdownRef}>
          <Link
            href={`/${lang}/carreras`}
            className="transition-colors opacity-80 hover:text-[var(--olivea-clay)] hover:opacity-100"
          >
            {dict.footer.careers}
          </Link>
          <Link
            href={`/${lang}/legal`}
            className="transition-colors opacity-80 hover:text-[var(--olivea-clay)] hover:opacity-100"
          >
            {dict.footer.legal}
          </Link>

          <button
            type="button"
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
                className="absolute bottom-full mb-2 right-0 bg-[#c6b7a8] backdrop-blur-md border border-gray-200 rounded-md shadow-lg z-[90] w-32"
              >
                <button
                  type="button"
                  onClick={() => switchLocale("en")}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--olivea-clay)] hover:text-white"
                >
                  🇺🇸 English
                </button>
                <button
                  type="button"
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

/** --- Footer Social Dock (hover-based clean icons) --- */
function FooterSocialDock({ items }: { items: SocialItem[] }) {
  return (
    <div className="flex-1 flex justify-center items-center gap-3">
      {items.map((it) => (
        <FooterSocialIcon key={it.id} item={it} />
      ))}
    </div>
  )
}

function FooterSocialIcon({ item }: { item: SocialItem }) {
  const CELL_W = 36
  const CELL_H = 36
  const ICON_BASE_PX = 22 // adjust to taste

  return (
    <motion.a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex items-center justify-center text-[var(--olivea-olive)] opacity-85 hover:opacity-100 transition-[opacity,transform]"
      style={{ width: CELL_W, height: CELL_H }}
    >
      <motion.span
        variants={{
          rest: { scale: 1.0, filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" },
          hover: { scale: 1.15, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" },
        }}
        transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.2 }}
        className="leading-none"
        style={{ fontSize: ICON_BASE_PX }}
      >
        {item.icon}
      </motion.span>
    </motion.a>
  )
}
