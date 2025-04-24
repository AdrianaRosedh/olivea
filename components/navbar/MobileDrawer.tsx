"use client"

import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import LocaleSwitcher from "./LocaleSwitcher"
import FocusTrap from "focus-trap-react"
import { cn } from "@/lib/utils"

type Props = {
  isOpen: boolean
  onClose: () => void
  lang: "en" | "es"
}

const navVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
}

export default function MobileDrawer({ isOpen, onClose, lang }: Props) {
  const [clicked, setClicked] = useState<string | null>(null)
  const router = useRouter()

  const links = [
    { href: `/${lang}/restaurant`, label: "Olivea Farm To Table" },
    { href: `/${lang}/casa`, label: "Casa Olivea" },
    { href: `/${lang}/cafe`, label: "Olivea Café" },
  ]

  const handleClick = (href: string) => {
    setClicked(href)
    window.navigator.vibrate?.(10)

    setTimeout(() => {
      onClose()
      router.push(href)
    }, 200)
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

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

          <FocusTrap
            active={isOpen}
            focusTrapOptions={{
              allowOutsideClick: true,
              clickOutsideDeactivates: false,
              escapeDeactivates: true,
              returnFocusOnDeactivate: true,
            }}
          >
            <div className="fixed inset-0 z-[999] pointer-events-none">
              <motion.div
                initial={{ clipPath: "circle(0% at 92% 40px)" }}
                animate={{ clipPath: "circle(150% at 92% 40px)" }}
                exit={{ clipPath: "circle(0% at 92% 40px)" }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
                className="absolute top-0 right-0 w-full h-full bg-[var(--olivea-clay)] backdrop-blur-md flex flex-col items-center justify-center px-6 pointer-events-auto"
                aria-modal="true"
                role="dialog"
              >
                {/* Nav Buttons */}
                <nav className="flex flex-col gap-5 w-full max-w-sm" aria-label="Main mobile navigation">
                  {links.map(({ href, label }, i) => (
                    <motion.button
                      key={href}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={navVariants}
                      onClick={() => handleClick(href)}
                      aria-label={`Go to ${label}`}
                      className={cn(
                        "w-full text-center px-6 py-3 rounded-md text-lg font-semibold uppercase transition-colors outline-none focus:ring-2 focus:ring-white",
                        clicked === href
                          ? "bg-[var(--olivea-soil)] text-white"
                          : "bg-[var(--olivea-cream)] text-[var(--olivea-soil)] border border-[var(--olivea-soil)] hover:bg-[var(--olivea-soil)] hover:text-white",
                      )}
                    >
                      {label}
                    </motion.button>
                  ))}
                </nav>

                {/* Language Switcher */}
                <motion.div
                  className="mt-10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                >
                  <LocaleSwitcher currentLang={lang} />
                </motion.div>
              </motion.div>
            </div>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  )
}
