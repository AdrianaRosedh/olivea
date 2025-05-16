// components/navigation/LocaleSwitcher.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";

const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
] as const;
type LocaleCode = (typeof languages)[number]["code"];

interface LocaleSwitcherProps {
  currentLang: LocaleCode;
  className?: string;
}

export default function LocaleSwitcher({ currentLang, className = "" }: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function switchLocale(locale: LocaleCode) {
    Cookies.set("NEXT_LOCALE", locale, { path: "/" });
    const newPath = pathname.replace(/^\/(en|es)/, `/${locale}`) || `/${locale}`;
    router.push(newPath);
    setOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-wide transition-colors duration-300",
          className ||
            "border-[var(--olivea-olive)] text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)] hover:text-white"
        )}
      >
        {currentLang.toUpperCase()}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
              .filter((l) => l.code !== currentLang)
              .map(({ code, label }) => (
                <motion.button
                  key={code}
                  onClick={() => switchLocale(code)}
                  whileTap={{ scale: 0.97 }}
                  className="block w-full text-left px-4 py-2 text-sm text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)] hover:text-white transition-colors"
                >
                  {label}
                </motion.button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
