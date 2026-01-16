"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X } from "lucide-react";

type Lang = "es" | "en";
type BannerType = "notice" | "promo" | "warning";

type BannerPayload = {
  id: string;
  type: BannerType;
  lang: Lang;
  text: string;
  dismissible: boolean;
};

type BannerApiResponse = { banner: unknown };

const STORAGE_PREFIX = "olivea:banner:dismissed:";

// Without touching footers, we anchor above them using constants.
// Tweak once and you’re done.
const DESKTOP_FOOTER_OFFSET_PX = 56;
const MOBILE_BOTTOMBAR_OFFSET_PX = 72;

// Delay before showing
const APPEAR_DELAY_MS_DESKTOP = 2200;
const APPEAR_DELAY_MS_MOBILE = 2600;

// Typed ease tuple for Framer Motion
const EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isBannerPayload(v: unknown): v is BannerPayload {
  if (!isObject(v)) return false;
  if (typeof v.id !== "string") return false;
  if (v.type !== "notice" && v.type !== "promo" && v.type !== "warning") return false;
  if (v.lang !== "es" && v.lang !== "en") return false;
  if (typeof v.text !== "string") return false;
  if (typeof v.dismissible !== "boolean") return false;
  return true;
}

function labelFor(type: BannerType, lang: Lang) {
  if (type === "promo") return "PROMO";
  if (type === "warning") return lang === "es" ? "AVISO" : "NOTICE";
  return "INFO";
}

export default function SiteBanner() {
  const pathname = usePathname();
  const lang: Lang = pathname?.startsWith("/en") ? "en" : "es";
  const reduce = useReducedMotion();

  const [banner, setBanner] = useState<BannerPayload | null>(null);
  const [hidden, setHidden] = useState(false);

  // Delayed appearance
  const [armed, setArmed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Desktop detection (only for delay timing)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Fetch active banner
  useEffect(() => {
    let cancelled = false;

    const p = pathname ?? "/";
    const url = `/api/banner?lang=${lang}&path=${encodeURIComponent(p)}`;

    fetch(url, { cache: "no-store" })
      .then((r) => r.json() as Promise<unknown>)
      .then((data) => {
        if (cancelled) return;

        if (!isObject(data) || !("banner" in data)) {
          setBanner(null);
          return;
        }

        const maybe = (data as BannerApiResponse).banner;
        setBanner(isBannerPayload(maybe) ? maybe : null);
      })
      .catch(() => {
        if (!cancelled) setBanner(null);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, pathname]);

  const dismissKey = useMemo(
    () => (banner ? `${STORAGE_PREFIX}${banner.id}` : ""),
    [banner]
  );

  // Respect dismissal
  useEffect(() => {
    if (!banner) return;
    try {
      setHidden(localStorage.getItem(dismissKey) === "1");
    } catch {
      setHidden(false);
    }
  }, [banner, dismissKey]);

  const dismiss = useCallback(() => {
    setHidden(true);
    try {
      if (banner) localStorage.setItem(dismissKey, "1");
    } catch {}
  }, [banner, dismissKey]);

  // Arm after delay
  useEffect(() => {
    if (!banner || hidden) {
      setArmed(false);
      return;
    }

    if (reduce) {
      setArmed(true);
      return;
    }

    const delay = isDesktop ? APPEAR_DELAY_MS_DESKTOP : APPEAR_DELAY_MS_MOBILE;
    const t = window.setTimeout(() => setArmed(true), delay);
    return () => window.clearTimeout(t);
  }, [banner, hidden, reduce, isDesktop]);

  if (!banner || hidden || !armed) return null;

  const label = labelFor(banner.type, lang);

  // Bottom positioning: mobile above bottom nav; desktop above fixed footer
  const rootStyle = {
    bottom: `calc(env(safe-area-inset-bottom) + ${MOBILE_BOTTOMBAR_OFFSET_PX}px)`,
  } as const;

  // Typed variants (strict TS friendly)
  const containerVariants: Variants = reduce
    ? {}
    : {
        hidden: { opacity: 0, y: 12, filter: "blur(10px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            type: "spring" as const,
            stiffness: 240,
            damping: 26,
            mass: 0.9,
          },
        },
        exit: {
          opacity: 0,
          y: 8,
          filter: "blur(10px)",
          transition: { duration: 0.22, ease: EASE },
        },
      };

  const textVariants: Variants = reduce
    ? {}
    : {
        hidden: {
          opacity: 0,
          clipPath: "inset(0 100% 0 0)",
          filter: "blur(6px)",
        },
        show: {
          opacity: 1,
          clipPath: "inset(0 0% 0 0)",
          filter: "blur(0px)",
          transition: {
            duration: 0.55,
            ease: EASE,
            delay: 0.08,
          },
        },
      };

  return (
    <div
      className="fixed inset-x-0 z-50 pointer-events-none"
      style={rootStyle}
      data-olivea-banner-root
    >
      {/* Desktop override: anchor above your fixed desktop footer */}
      <style>{`
        @media (min-width: 768px){
          [data-olivea-banner-root]{ bottom: ${DESKTOP_FOOTER_OFFSET_PX}px !important; }
        }
        @media (prefers-reduced-motion: reduce){
          .olivea-banner-sheen{ animation: none !important; }
          .olivea-banner-dot{ animation: none !important; }
        }
        @keyframes oliveaSheenSweep {
          0%, 86%   { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          88%       { opacity: 0.26; }
          92%       { opacity: 0.16; }
          100%      { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        }
        .olivea-banner-sheen{
          position:absolute; inset:0;
          width:60%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.34) 45%,
            rgba(255,255,255,0.10) 55%,
            transparent 100%
          );
          animation: oliveaSheenSweep 12s ease-in-out infinite;
          filter: blur(0.2px);
        }
        @keyframes oliveaDotPulse {
          0%, 100% { transform: scale(1); opacity: .55; }
          50%      { transform: scale(1.5); opacity: .18; }
        }
        .olivea-banner-dot{
          animation: oliveaDotPulse 2.6s ease-in-out infinite;
        }
      `}</style>

      <div className="mx-auto w-full max-w-275 px-3 md:px-4">
        <AnimatePresence>
          <motion.div
            className={[
              "pointer-events-auto",
              "relative w-full",
              "rounded-2xl",
              "bg-(--olivea-cream)/96",
              "backdrop-blur-md",
              "ring-1 ring-(--olivea-olive)/16",
              "shadow-[0_18px_54px_-40px_rgba(0,0,0,0.30)]",
            ].join(" ")}
            variants={containerVariants}
            initial={reduce ? false : "hidden"}
            animate={reduce ? undefined : "show"}
            exit={reduce ? undefined : "exit"}
          >
            {/* Subtle sheen sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="olivea-banner-sheen" />
            </div>

            <div className="flex items-center gap-3 px-4 py-3 md:py-2.5">
              {/* Dismiss — LEFT on mobile, RIGHT on desktop */}
              {banner.dismissible ? (
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label={lang === "es" ? "Cerrar" : "Close"}
                  className="order-1 md:order-3 shrink-0 h-10 w-10 md:h-9 md:w-9 inline-flex items-center justify-center rounded-full bg-white/80 ring-1 ring-(--olivea-olive)/14 text-(--olivea-olive) hover:bg-white/95 transition"
                >
                  <X
                    size={18}
                    strokeWidth={1.75}
                    className="translate-x-[0.5px] translate-y-[0.5px]"
                  />
                </button>
              ) : null}

              {/* Label + pulse dot */}
              <div className="order-2 shrink-0 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-(--olivea-olive)/55 olivea-banner-dot" />
                <span className="text-[11px] tracking-[0.22em] uppercase text-(--olivea-olive) opacity-80">
                  {label}
                </span>
              </div>

              {/* Animated text reveal */}
              <motion.p
                className={[
                  "order-3 md:order-2",
                  "min-w-0 flex-1",
                  "text-[13.5px] md:text-[14px]",
                  "text-(--olivea-ink)",
                  "opacity-95",
                  "line-clamp-2 md:line-clamp-1",
                ].join(" ")}
                variants={textVariants}
                initial={reduce ? false : "hidden"}
                animate={reduce ? undefined : "show"}
              >
                {banner.text}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
