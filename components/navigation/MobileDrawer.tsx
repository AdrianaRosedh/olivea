"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import FocusTrap from "focus-trap-react";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import { FaYoutube, FaInstagram, FaTiktok, FaLinkedin, FaSpotify, FaPinterest } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "es";
  dict: AppDictionary;
}

const navVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  }),
};

export default function MobileDrawer({ isOpen, onClose, lang, dict }: Props) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const mainLinks = [
    { href: `/${lang}/farmtotable`, label: dict.drawer.main.farmtotable },
    { href: `/${lang}/casa`, label: dict.drawer.main.casa },
    { href: `/${lang}/cafe`, label: dict.drawer.main.cafe },
  ];
  
  const moreLinks = [
    { href: `/${lang}/journal`, label: dict.drawer.more.journal },
    { href: `/${lang}/sustainability`, label: dict.drawer.more.sustainability },
    { href: `/${lang}/awards-reviews`, label: dict.drawer.more.awards },
    { href: `/${lang}/contact`, label: dict.drawer.more.contact },
    { href: `/${lang}/legal`, label: dict.drawer.more.legal },
  ];

  const handleClick = (href: string) => {
    window.navigator.vibrate?.(10);
    onClose();
    router.push(href);
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-[998]"
          />

          <FocusTrap active={isOpen} focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: true }}>
            <div className="fixed inset-0 z-[999] pointer-events-none">
              <motion.div
                initial={{ clipPath: "circle(0% at 92% 40px)" }}
                animate={{ clipPath: "circle(150% at 92% 40px)" }}
                exit={{ clipPath: "circle(0% at 92% 40px)" }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
                className="absolute top-0 right-0 w-full h-full bg-[var(--olivea-olive)] flex flex-col items-center justify-between px-6 py-10 pointer-events-auto overflow-hidden"
                aria-modal="true"
                role="dialog"
              >
                <div className="flex flex-col items-center w-full gap-4 mt-12">
                  {mainLinks.map(({ href, label }, i) => (
                    <motion.button
                      key={href}
                      custom={i}
                      variants={navVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleClick(href)}
                      className="w-full px-6 py-3 rounded-md text-lg font-semibold uppercase border border-[var(--olivea-cream)] text-[var(--olivea-cream)] hover:bg-[var(--olivea-cream)]/20 transition-colors"
                    >
                      {label}
                    </motion.button>
                  ))}

                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="w-full mt-2 px-6 py-2 rounded-full bg-[var(--olivea-cream)]/20 text-[var(--olivea-cream)] text-sm uppercase transition-colors hover:bg-[var(--olivea-cream)]/30"
                  >
                    {showMore ? (lang === "es" ? "Ocultar" : "Hide") : (lang === "es" ? "Ver Más" : "See More")}
                  </button>


                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        {moreLinks.map(({ href, label }) => (
                          <button
                            key={href}
                            onClick={() => handleClick(href)}
                            className="px-4 py-2 text-sm rounded-md text-[var(--olivea-cream)] bg-[var(--olivea-cream)]/10 hover:bg-[var(--olivea-cream)]/20 transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col items-center gap-4">
                <LocaleSwitcher
                  currentLang={lang}
                  className="border-[var(--olivea-cream)] text-[var(--olivea-cream)] hover:bg-[var(--olivea-cream)] hover:text-[var(--olivea-olive)]"
                />
                  <div className="flex gap-3">
                    <FaYoutube className="text-[var(--olivea-shell)]" size={20} />
                    <FaInstagram className="text-[var(--olivea-shell)]" size={20} />
                    <FaTiktok className="text-[var(--olivea-shell)]" size={20} />
                    <FaLinkedin className="text-[var(--olivea-shell)]" size={20} />
                    <FaSpotify className="text-[var(--olivea-shell)]" size={20} />
                    <FaPinterest className="text-[var(--olivea-shell)]" size={20} />
                  </div>
                  <button
                    onClick={() => handleClick(`/${lang}/about`)}
                    className="text-xs text-[var(--olivea-shell)] hover:underline"
                  >
                    © 2025 Inmobiliaria MYA by DH
                  </button>
                </div>
              </motion.div>
            </div>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  );
}
