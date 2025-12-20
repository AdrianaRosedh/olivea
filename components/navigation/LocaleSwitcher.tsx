"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

export default function LocaleSwitcher({
  currentLang,
  className = "",
}: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Close when route changes (feels cleaner in drawers)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Outside click + Escape
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) close();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close]);

  function switchLocale(locale: LocaleCode) {
    Cookies.set("NEXT_LOCALE", locale, { path: "/" });

    const newPath =
      pathname?.replace(/^\/(en|es)(?=\/|$)/, `/${locale}`) || `/${locale}`;

    router.push(newPath);
    setOpen(false);
  }

  const otherLanguages = languages.filter((l) => l.code !== currentLang);

  return (
    <div ref={dropdownRef} className="relative inline-flex">
      <motion.button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-wide",
          "transition-colors duration-300",
          className ||
            "border-(--olivea-olive) text-(--olivea-olive) hover:bg-(--olivea-olive) hover:text-white"
        )}
      >
        {currentLang.toUpperCase()}

        <motion.span
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="inline-flex"
        >
          <ChevronDown size={16} />
        </motion.span>
      </motion.button>

      {/* Dropdown: POPS UPWARD */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              // KEY: anchored above the pill
              "absolute right-0 bottom-full mb-3 z-50",
              // styling
              "min-w-42.5 overflow-hidden rounded-2xl",
              "bg-(--olivea-cream) ring-1 ring-(--olivea-olive)/30 shadow-md"
            )}
            style={{ transformOrigin: "bottom right" }}
          >
            {otherLanguages.map(({ code, label }) => (
              <motion.button
                key={code}
                type="button"
                role="menuitem"
                onClick={() => switchLocale(code)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "block w-full text-left px-4 py-3 text-sm",
                  "text-(--olivea-olive)",
                  "hover:bg-(--olivea-olive) hover:text-white transition-colors",
                  "border-t border-(--olivea-olive)/15 first:border-t-0"
                )}
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
