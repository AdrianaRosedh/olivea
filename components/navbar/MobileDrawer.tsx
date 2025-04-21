"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import LocaleSwitcher from "./LocaleSwitcher"
import MenuToggle from "./MenuToggle"

type Props = {
  isOpen: boolean
  onClose: () => void
  lang: "en" | "es"
}

export default function MobileDrawer({ isOpen, onClose, lang }: Props) {
  const links = [
    { href: `/${lang}/casa`, label: "Casa Olivea" },
    { href: `/${lang}/restaurant`, label: "Olivea Farm To Table" },
    { href: `/${lang}/cafe`, label: "Olivea Café" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[998]"
          />

          {/* Drawer with MenuToggle */}
          <motion.div
            initial={{ clipPath: "circle(0% at 92% 40px)" }}
            animate={{ clipPath: "circle(150% at 92% 40px)" }}
            exit={{ clipPath: "circle(0% at 92% 40px)" }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            className="fixed top-0 right-0 w-full h-full bg-white z-[999] flex flex-col p-6 pt-16"
          >

            {/* Navigation Links */}
            <nav className="mt-4 flex flex-col gap-6 text-lg font-medium">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} onClick={onClose}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Language Switcher */}
            <div className="mt-10">
              <LocaleSwitcher currentLang={lang} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}