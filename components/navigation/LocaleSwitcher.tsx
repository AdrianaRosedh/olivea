"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";

const languages = [
  { code: "es", short: "ES", label: "Español" },
  { code: "en", short: "EN", label: "English" },
] as const;

type LocaleCode = (typeof languages)[number]["code"];

interface LocaleSwitcherProps {
  currentLang: LocaleCode;
  /** "dark": cream on the olive menu. "light": olive on the cream page. */
  tone?: "dark" | "light";
  /** Sized in em, so it scales with its surroundings (the desktop footer
   *  shrinks its whole row on narrow windows). */
  className?: string;
  /** Called just before the language changes (the phone menu uses it to
   *  stay open). With it, the switch navigates directly instead of through
   *  the page's content fade, which would only be hidden behind the menu. */
  onSwitch?: (locale: LocaleCode) => void;
}

// ✅ Trigger a real <a> click so SubtleContentFade can intercept & animate.
function fadeNavigate(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * ES | EN as one toggle. With two languages a dropdown was a menu of one:
 * tap, read, tap again. Both choices now show at once; the pill slides to the
 * one chosen, then the page changes language.
 */
export default function LocaleSwitcher({
  currentLang,
  tone = "dark",
  className,
  onSwitch,
}: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pillId = useId();
  // Moves the pill at once; the page follows a moment later so the slide is seen.
  const [shown, setShown] = useState<LocaleCode>(currentLang);

  function switchLocale(locale: LocaleCode) {
    if (locale === shown) return;
    setShown(locale);
    Cookies.set("NEXT_LOCALE", locale, { path: "/" });
    const newPath =
      pathname?.replace(/^\/(en|es)(?=\/|$)/, `/${locale}`) || `/${locale}`;
    window.setTimeout(() => {
      if (onSwitch) {
        onSwitch(locale);
        router.push(newPath, { scroll: false });
      } else {
        fadeNavigate(newPath);
      }
    }, 180);
  }

  const dark = tone === "dark";

  return (
    <div
      role="radiogroup"
      aria-label={currentLang === "es" ? "Idioma" : "Language"}
      className={cn(
        "relative inline-flex items-center rounded-full p-[0.2em]",
        dark ? "ring-1 ring-(--olivea-cream)/45" : "ring-1 ring-(--olivea-olive)/30",
        className
      )}
    >
      {languages.map(({ code, short, label }) => {
        const active = shown === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            lang={code}
            onClick={() => switchLocale(code)}
            className={cn(
              "relative z-0 rounded-full px-[0.95em] py-[0.38em]",
              "text-[0.85em] font-semibold tracking-[0.14em] leading-none",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2",
              dark ? "focus-visible:ring-(--olivea-cream)/60" : "focus-visible:ring-(--olivea-olive)/40",
              active
                ? dark
                  ? "text-(--olivea-olive)"
                  : "text-(--olivea-cream)"
                : dark
                  ? "text-(--olivea-cream)"
                  : "text-(--olivea-olive)"
            )}
          >
            {active ? (
              <motion.span
                layoutId={pillId}
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 -z-10 rounded-full",
                  dark ? "bg-(--olivea-cream)" : "bg-(--olivea-olive)"
                )}
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              />
            ) : null}
            {short}
          </button>
        );
      })}
    </div>
  );
}
