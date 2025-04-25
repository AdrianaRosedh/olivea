'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
]

export default function LocaleSwitcher({ currentLang }: { currentLang: string }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = (locale: string) => {
    const newPath = pathname.replace(/^\/(en|es)/, '') || '/'
    router.push(`/${locale}${newPath}`)
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-wide 
          border-[var(--olivea-olive)] text-[var(--olivea-olive)] 
          hover:bg-[var(--olivea-olive)] hover:text-white transition-colors duration-300"
      >
        {currentLang.toUpperCase()}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 right-0 bg-[var(--olivea-cream)] border border-[var(--olivea-olive)] rounded-md z-50 shadow-md overflow-hidden"
          >
            {languages
              .filter((lang) => lang.code !== currentLang)
              .map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  whileTap={{ scale: 0.97 }}
                  className="block w-full text-left px-4 py-2 text-sm text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)] hover:text-white transition-colors"
                >
                  {lang.label}
                </motion.button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}