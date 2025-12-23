// components/navigation/MobileDrawer.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import FocusTrap from "focus-trap-react";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaSpotify,
  FaPinterest,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "es";
  dict: AppDictionary;
  origin?: { x: number; y: number };

  /**
   * Optional: called when the drawer is FULLY unmounted (after exit animation),
   * perfect moment to refresh AdaptiveNavbar background detection.
   */
  onExitComplete?: () => void;
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
  exit: { transition: { duration: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24, mass: 0.7 },
  },
};

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const body = document.body;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      const y = Math.abs(parseInt(body.style.top || "0", 10)) || scrollY;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, y);
    };
  }, [locked]);
}

export default function MobileDrawer({
  isOpen,
  onClose,
  lang,
  dict,
  origin,
  onExitComplete,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [itemsReady, setItemsReady] = useState(false);
  const [blurReady, setBlurReady] = useState(false);

  useBodyScrollLock(isOpen);

  // Faster staging:
  // - start items shortly after open (feels snappy)
  // - enable blur shortly after items begin (helps avoid flicker)
  useEffect(() => {
    if (!isOpen) {
      setItemsReady(false);
      setBlurReady(false);
      return;
    }

    setItemsReady(false);
    setBlurReady(false);

    const tItems = window.setTimeout(() => setItemsReady(true), 120);
    const tBlur = window.setTimeout(() => setBlurReady(true), 210);

    return () => {
      window.clearTimeout(tItems);
      window.clearTimeout(tBlur);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const tFarm = dict.drawer.main.farmtotable;
  const tCasa = dict.drawer.main.casa;
  const tCafe = dict.drawer.main.cafe;

  const mainLinks = useMemo(
    () => [
      { href: `/${lang}/farmtotable`, label: tFarm },
      { href: `/${lang}/casa`, label: tCasa },
      { href: `/${lang}/cafe`, label: tCafe },
    ],
    [lang, tFarm, tCasa, tCafe]
  );


  const moreLinks = useMemo(() => {
    return [
      { href: `/${lang}/press`, label: lang === "es" ? "Prensa" : "Press" },
      { href: `/${lang}/sustainability`, label: lang === "es" ? "Filosofía" : "Philosophy" },
      { href: `/${lang}/journal`, label: lang === "es" ? "Diario" : "Journal" },
      { href: `/${lang}/team`, label: lang === "es" ? "Equipo" : "Team" },    
      { href: `/${lang}/contact`, label: lang === "es" ? "Contáctanos" : "Contact" },
      { href: `/${lang}/carreras`, label: lang === "es" ? "Carreras" : "Careers"},
    ];
  }, [lang]);

  const handleClick = (href: string) => {
    window.navigator.vibrate?.(10);
    onClose();
    window.setTimeout(() => router.push(href), 90);
  };

  const rightsText =
    lang === "en" ? "All rights reserved." : "Todos los derechos reservados.";

  const ox =
    origin?.x ??
    (typeof window !== "undefined" ? window.innerWidth * 0.92 : 360);
  const oy = origin?.y ?? 40;

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const blurClass = blurReady ? "backdrop-blur-md" : "";

  return (
    <AnimatePresence
      onExitComplete={() => {
        // ✅ best moment to refresh AdaptiveNavbar sampling
        onExitComplete?.();

        // ✅ also supports the event-based wiring (no-refactor)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("olivea:drawer-exit"));
        }
      }}
    >
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label={lang === "es" ? "Cerrar menú" : "Close menu"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-998"
          />

          <FocusTrap
            active={isOpen}
            focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: true }}
          >
            <div className="fixed inset-0 z-999 pointer-events-none">
              <motion.div
                initial={{ clipPath: `circle(0px at ${ox}px ${oy}px)` }}
                animate={{ clipPath: `circle(140vmax at ${ox}px ${oy}px)` }}
                exit={{ clipPath: `circle(0px at ${ox}px ${oy}px)` }}
                transition={{ type: "spring", stiffness: 90, damping: 20 }}
                className="absolute inset-0 pointer-events-auto overflow-hidden"
                aria-modal="true"
                role="dialog"
              >
                {/* Background layers */}
                <div className="absolute inset-0 bg-(--olivea-olive)" />
                <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/25 opacity-80" />
                <div className="absolute inset-0 ring-1 ring-white/10" />

                <motion.div
                  variants={container}
                  initial="hidden"
                  animate={itemsReady ? "visible" : "hidden"}
                  exit="exit"
                  className="relative h-full w-full flex flex-col px-6 pb-10 pt-20"
                >
                  {/* Main links */}
                  <div className="flex flex-col gap-3">
                    {mainLinks.map(({ href, label }) => {
                      const active = isActive(href);
                      return (
                        <motion.button
                          key={href}
                          variants={item}
                          onClick={() => handleClick(href)}
                          className={[
                            "transform-gpu will-change-transform",
                            "w-full rounded-2xl px-6 py-4 text-left",
                            blurClass,
                            "ring-1",
                            "transition-colors duration-200",
                            "flex items-center justify-between",
                            "active:scale-[0.99] transition-transform duration-150",
                            "uppercase tracking-[0.14em] text-(--olivea-cream)",
                            active
                              ? "bg-white/16 ring-white/25"
                              : "bg-white/10 ring-white/15 hover:bg-white/12",
                          ].join(" ")}
                        >
                          <span className="text-base font-semibold">{label}</span>
                          <span
                            className={
                              active
                                ? "text-(--olivea-cream)"
                                : "text-(--olivea-cream)/70"
                            }
                          >
                            ↗
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.div variants={item} className="mt-5">
                    <div className="h-px w-full bg-white/10" />
                  </motion.div>

                  {/* More links */}
                  <motion.div variants={item} className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {moreLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                          <button
                            key={href}
                            onClick={() => handleClick(href)}
                            className={[
                              "transform-gpu will-change-transform",
                              "rounded-2xl px-4 py-3 text-sm text-left",
                              blurClass,
                              "ring-1",
                              "transition-colors duration-200",
                              "active:scale-[0.99] transition-transform duration-150",
                              "text-(--olivea-cream)",
                              active
                                ? "bg-white/12 ring-white/20"
                                : "bg-white/6 ring-white/10 hover:bg-white/10",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  <div className="flex-1 min-h-6" />

                  {/* Footer */}
                  <div className="flex flex-col items-center gap-4 pb-2">
                    <motion.div
                      variants={item}
                      className="transform-gpu will-change-transform"
                    >
                      <LocaleSwitcher
                        currentLang={lang}
                        className="border-(--olivea-cream) text-(--olivea-cream) hover:bg-(--olivea-cream) hover:text-(--olivea-olive)"
                      />
                    </motion.div>

                    <motion.div
                      variants={item}
                      className="flex gap-5 transform-gpu will-change-transform"
                    >
                      <a
                        href="https://www.youtube.com/@GrupoOlivea"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <FaYoutube size={20} />
                      </a>
                      <a
                        href="https://instagram.com/oliveafarmtotable/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <FaInstagram size={20} />
                      </a>
                      <a
                        href="https://www.tiktok.com/@grupoolivea"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok"
                        className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <FaTiktok size={20} />
                      </a>
                      <a
                        href="https://www.linkedin.com/company/inmobiliaria-casa-olivea/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <FaLinkedin size={20} />
                      </a>
                      <a
                        href="https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Spotify"
                        className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <FaSpotify size={20} />
                      </a>
                      <a
                        href="https://mx.pinterest.com/familiaolivea/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Pinterest"
                        className="text-(--olivea-shell) opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <FaPinterest size={20} />
                      </a>
                    </motion.div>

                    <motion.button
                      variants={item}
                      onClick={() => handleClick(`/${lang}/about`)}
                      className="text-xs text-(--olivea-shell) opacity-80 hover:opacity-100 hover:underline text-center transform-gpu will-change-transform"
                    >
                      Copyright © {new Date().getFullYear()} Casa Olivea AC.
                      <br />
                      {rightsText}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </FocusTrap>
        </>
      )}
    </AnimatePresence>
  );
}