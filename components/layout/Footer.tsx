"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import { AnimatePresence, motion } from "framer-motion";
import { GlobeIcon } from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaSpotify,
  FaPinterest,
} from "react-icons/fa";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";

interface FooterProps {
  dict: AppDictionary;
}

type SocialItem = {
  id: string;
  href: string;
  label: string;
  icon: ReactNode;
};

// ✅ Trigger a real <a> click so SubtleContentFade can intercept & animate.
function fadeNavigate(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function Footer({ dict }: FooterProps) {
  const pathname = usePathname() ?? "/es";

  const firstSeg = pathname.split("/")[1];
  const lang: "en" | "es" = firstSeg === "en" ? "en" : "es";

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [lift, setLift] = useState(0);

  // subtle one-time attention to language toggle
  const [hintLang, setHintLang] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setHintLang(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside, {
      passive: true,
    });
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  useEffect(() => {
    function calcLift() {
      const bubble =
        document.querySelector<HTMLElement>('[data-whistle-launcher]') ||
        document.querySelector<HTMLElement>("#whistle-widget") ||
        document.querySelector<HTMLElement>(".whistle-launcher") ||
        document.querySelector<HTMLElement>('[data-widget="whistle"]') ||
        document.querySelector<HTMLElement>('[id*="cloudbeds"]') ||
        document.querySelector<HTMLElement>('[class*="cloudbeds"]');

      if (!bubble) {
        setLift(0);
        return;
      }

      const r = bubble.getBoundingClientRect();
      const barH = 52;
      const pad = 16;

      const overlapsVert = r.bottom > window.innerHeight - (pad + barH);
      setLift(overlapsVert ? Math.ceil(r.height) + 8 : 0);
    }

    const ro = new ResizeObserver(calcLift);
    const mo = new MutationObserver(calcLift);

    [
      "[data-whistle-launcher]",
      "#whistle-widget",
      ".whistle-launcher",
      '[data-widget="whistle"]',
      '[id*="cloudbeds"]',
      '[class*="cloudbeds"]',
    ].forEach((sel) => {
      const n = document.querySelector<HTMLElement>(sel);
      if (n) ro.observe(n);
    });

    calcLift();
    window.addEventListener("resize", calcLift, { passive: true });
    window.addEventListener("scroll", calcLift, { passive: true });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", calcLift);
      window.removeEventListener("scroll", calcLift);
    };
  }, []);

  const switchLocale = (newLang: "en" | "es") => {
    if (newLang === lang) {
      setOpen(false);
      return;
    }

    Cookies.set("NEXT_LOCALE", newLang, { path: "/" });

    const segments = pathname.split("/");
    let newPath: string;

    if (segments[1] === "en" || segments[1] === "es") {
      segments[1] = newLang;
      newPath = segments.join("/") || `/${newLang}`;
    } else {
      const suffix = pathname.startsWith("/") ? pathname : `/${pathname}`;
      newPath = `/${newLang}${suffix === "/" ? "" : suffix}`;
    }

    // ✅ close first, then navigate via <a> so SubtleContentFade fades
    setOpen(false);
    fadeNavigate(newPath);
  };

  // ✅ cleaner “signature” rights
  const rightsText =
    lang === "en" ? "All rights reserved" : "Todos los derechos reservados";

  const socialItems: SocialItem[] = [
    {
      id: "yt",
      href: "https://www.youtube.com/@GrupoOlivea",
      label: "YouTube",
      icon: <FaYoutube />,
    },
    {
      id: "ig",
      href: "https://instagram.com/oliveafarmtotable/",
      label: "Instagram",
      icon: <FaInstagram />,
    },
    {
      id: "tt",
      href: "https://www.tiktok.com/@familiaolivea",
      label: "TikTok",
      icon: <FaTiktok />,
    },
    {
      id: "li",
      href: "https://www.linkedin.com/company/inmobiliaria-casa-olivea/",
      label: "LinkedIn",
      icon: <FaLinkedin />,
    },
    {
      id: "sp",
      href: "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8",
      label: "Spotify",
      icon: <FaSpotify />,
    },
    {
      id: "pt",
      href: "https://mx.pinterest.com/familiaolivea/",
      label: "Pinterest",
      icon: <FaPinterest />,
    },
  ];

  const TextLink = ({
    href,
    children,
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <Link
      href={href}
      className={[
        "group relative inline-flex items-center",
        "opacity-80 hover:opacity-100",
        "transition-[opacity,transform,color] duration-200",
        "hover:-translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-clay)/40",
      ].join(" ")}
    >
      <span className="transition-colors group-hover:text-(--olivea-clay)">
        {children}
      </span>
      {/* underline reveal */}
      <span
        className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{
          background:
            "linear-gradient(90deg, rgba(94,118,88,0.0), rgba(94,118,88,0.65), rgba(94,118,88,0.0))",
        }}
      />
    </Link>
  );

  return (
    <footer className="fixed bottom-0 left-0 w-full z-200 bg-transparent backdrop-blur-md text-[12px] text-(--olivea-ink) font-light tracking-wide pointer-events-auto isolate">
      {/* subtle top divider haze */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(94,118,88,0.25), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="w-full flex justify-between items-center px-2 sm:px-3 py-2">
        {/* LEFT: language (first) + links */}
        <div
          className="flex-1 flex items-center justify-start gap-3 relative"
          ref={dropdownRef}
        >
          {/* Language toggle (subtle attention + dot) */}
          <div
            style={{
              transform: lift ? `translateY(-${lift}px)` : undefined,
              transition: "transform 200ms ease",
            }}
          >
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              aria-haspopup="menu"
              aria-expanded={open}
              className={[
                "group relative flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md",
                "transition-[transform,box-shadow,background-color,color,border-color] duration-200",
                "border border-[rgba(0,0,0,0.06)]",
                "hover:bg-(--olivea-clay) hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-clay)/40",
              ].join(" ")}
              style={{
                boxShadow:
                  open || hintLang ? "0 0 0 3px rgba(94,118,88,0.16)" : undefined,
              }}
            >
              {/* tiny status dot */}
              <span
                className="absolute -left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
                style={{
                  background: "rgba(94,118,88,0.85)",
                  opacity: open ? 0.95 : 0.55,
                }}
                aria-hidden="true"
              />
              {/* spotlight */}
              <span
                className="pointer-events-none absolute -inset-2 rounded-xl opacity-0 transition-opacity duration-300"
                style={{
                  opacity: open ? 1 : hintLang ? 0.55 : 0,
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(94,118,88,0.18), rgba(94,118,88,0.0) 65%)",
                }}
                aria-hidden="true"
              />
              <GlobeIcon className="w-4 h-4 text-current transition-colors" />
              {lang.toUpperCase()}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  onPointerDown={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute bottom-full mb-2 left-0 bg-[#e7eae1] backdrop-blur-md border border-gray-200 rounded-md shadow-lg z-500 w-32 pointer-events-auto overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => switchLocale("en")}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-(--olivea-clay) hover:text-white transition-colors"
                  >
                    🇺🇸 English
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLocale("es")}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-(--olivea-clay) hover:text-white transition-colors"
                  >
                    🇲🇽 Español
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <TextLink href={`/${lang}/carreras`}>{dict.footer.careers}</TextLink>
          <TextLink href={`/${lang}/legal`}>{dict.footer.legal}</TextLink>
        </div>

        {/* CENTER: Social Dock */}
        <FooterSocialDock items={socialItems} />

        {/* RIGHT: rights */}
        <div className="flex-1 whitespace-nowrap text-right">
          <span className="cursor-default opacity-80 transition-colors hover:text-(--olivea-clay)">
            © {new Date().getFullYear()} Casa Olivea A.C.
            <span className="relative mx-1 inline-block align-middle">
              <span className="block h-0.75 w-0.75 rounded-full bg-current opacity-60" />
            </span>{" "}
            {rightsText}
          </span>
        </div>
      </div>
    </footer>
  );
}

/** --- Footer Social Dock (hover-based clean icons) --- */
function FooterSocialDock({ items }: { items: SocialItem[] }) {
  return (
    <div className="flex-1 flex justify-center items-center gap-3">
      {items.map((it) => (
        <FooterSocialIcon key={it.id} item={it} />
      ))}
    </div>
  );
}

function FooterSocialIcon({ item }: { item: SocialItem }) {
  const CELL_W = 36;
  const CELL_H = 36;
  const ICON_BASE_PX = 22;

  return (
    <motion.a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="flex items-center justify-center text-(--olivea-olive) opacity-85 hover:opacity-100 transition-[opacity,transform]"
      style={{ width: CELL_W, height: CELL_H }}
    >
      <motion.span
        variants={{
          rest: { scale: 1.0, filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" },
          hover: {
            scale: 1.15,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
          },
        }}
        transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.2 }}
        className="leading-none"
        style={{ fontSize: ICON_BASE_PX }}
      >
        {item.icon}
      </motion.span>
    </motion.a>
  );
}
