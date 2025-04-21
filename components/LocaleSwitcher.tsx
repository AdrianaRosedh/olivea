'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

export default function LocaleSwitcher({ currentLang }: { currentLang: string }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

  // ⛔ Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const switchLocale = (locale: string) => {
    const newPath = pathname.replace(/^\/(en|es)/, '') || '/'
    router.push(`/${locale}${newPath}`)
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-white bg-black rounded-full border border-white"
      >
        {currentLang.toUpperCase()}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 right-0 bg-white shadow-lg rounded-md z-50 overflow-hidden"
          >
            {languages
              .filter((lang) => lang.code !== currentLang)
              .map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                >
                  {lang.label}
                </button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}