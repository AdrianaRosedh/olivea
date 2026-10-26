"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Lang } from "@/lib/i18n";
import {
  motion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { X } from "lucide-react";
import { isFlagSet, setFlag } from "@/lib/storage";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
type BannerType = "notice" | "promo" | "warning";

type BannerPayload = {
  id: string;
  type: BannerType;
  lang: Lang;
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
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
  const reduce = usePrefersReducedMotion();

  const [banner, setBanner] = useState<BannerPayload | null>(null);
  const [hidden, setHidden] = useState(false);

  // Delayed appearance
  const [armed, setArmed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // Phones: past the first screen the promo shrinks to a small pill at the
  // left (dot + label), so the bottom of the screen is not three bars deep.
  // It never disappears: a tap opens the line again, and it opens by itself
  // back near the top of the page.
  const [compact, setCompact] = useState(false);

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
    const controller = new AbortController();
    const p = pathname ?? "/";
    const url = `/api/banner?lang=${lang}&path=${encodeURIComponent(p)}`;

    fetch(url, { cache: "default", signal: controller.signal })
      .then((r) => r.json() as Promise<unknown>)
      .then((data) => {
        if (controller.signal.aborted) return;

        if (!isObject(data) || !("banner" in data)) {
          setBanner(null);
          return;
        }

        const maybe = (data as BannerApiResponse).banner;
        setBanner(isBannerPayload(maybe) ? maybe : null);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setBanner(null);
      });

    return () => controller.abort();
  }, [lang, pathname]);

  const dismissKey = useMemo(
    () => (banner ? `${STORAGE_PREFIX}${banner.id}` : ""),
    [banner]
  );

  // Respect dismissal
  useEffect(() => {
    if (!banner) return;
    setHidden(isFlagSet(dismissKey));
  }, [banner, dismissKey]);

  const dismiss = useCallback(() => {
    setHidden(true);
    if (banner) setFlag(dismissKey);
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

  useEffect(() => {
    if (isDesktop) {
      setCompact(false);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > window.innerHeight * 0.9) setCompact(true);
        else if (y < window.innerHeight * 0.4) setCompact(false);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isDesktop]);

  // While the banner shows, publish how much room it takes at the bottom so
  // the phone's floating dock (MobileNav) rises above it instead of sitting
  // on its arrow button. Cleared when the banner goes.
  const visible = !!banner && !hidden && armed;
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.removeProperty("--olivea-banner-clear");
      return;
    }
    const card = document.querySelector<HTMLElement>("[data-olivea-banner-root] .pointer-events-auto");
    if (!card) return;
    const publish = () => root.style.setProperty("--olivea-banner-clear", `${Math.round(card.getBoundingClientRect().height) + 10}px`);
    publish();
    // Report on the next frame: while the bar animates between its full line
    // and the compact pill, writing the variable inside the observer moved
    // the dock in the same frame ("ResizeObserver loop" in the console).
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(publish);
    });
    ro.observe(card);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.style.removeProperty("--olivea-banner-clear");
    };
  }, [visible]);

  if (!visible) return null;

  const label = labelFor(banner.type, lang);

  // Bottom positioning: mobile above bottom nav; desktop above fixed footer.
  // On a phone it sits on the chapter bar's MEASURED height (--mobile-dock-h,
  // safe area included). A fixed 72px left it behind the bar whenever the bar
  // grew its title row at the end of a page. Pages without the bar keep 72px.
  const rootStyle = {
    bottom: `calc(var(--mobile-dock-h, calc(env(safe-area-inset-bottom) + ${MOBILE_BOTTOMBAR_OFFSET_PX - 8}px)) + 8px)`,
    transition: "bottom 220ms cubic-bezier(0.22, 1, 0.36, 1)",
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
      // Above the footer (200), whose fade would otherwise wash its lower
      // edge; below every overlay and modal (999+).
      className="fixed inset-x-0 z-210 pointer-events-none"
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

      <div className={`mx-auto flex w-full max-w-275 px-3 md:px-4 ${compact ? "justify-start" : ""}`}>
        <AnimatePresence>
          <motion.div
            layout={!reduce}
            transition={{ layout: { duration: 0.32, ease: EASE } }}
            className={[
              "pointer-events-auto",
              compact ? "relative w-auto" : "relative w-full",
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

            {compact ? (
              <button
                type="button"
                onClick={() => setCompact(false)}
                aria-label={`${label}: ${banner.text}`}
                className="relative flex h-11 items-center gap-2 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-(--olivea-olive)"
              >
                <span aria-hidden className="h-2 w-2 rounded-full bg-(--olivea-olive)/55 olivea-banner-dot" />
                {label}
              </button>
            ) : (
            <div className="flex items-center gap-2.5 md:gap-3 px-2.5 md:px-4 py-2 md:py-2.5">
              {/* Dismiss — LEFT on mobile, RIGHT on desktop */}
              {banner.dismissible ? (
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label={lang === "es" ? "Cerrar" : "Close"}
                  className="order-1 md:order-4 shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/80 ring-1 ring-(--olivea-olive)/14 text-(--olivea-olive) hover:bg-white/95 transition"
                >
                  <X
                    size={18}
                    strokeWidth={1.75}
                    className="translate-x-[0.5px] translate-y-[0.5px]"
                  />
                </button>
              ) : null}

              {/* Label + pulse dot (desktop). On a phone the promo is one slim
                  line: the dot leads the message and the label is left out. */}
              <div className="order-2 shrink-0 hidden md:flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-(--olivea-olive)/55 olivea-banner-dot" />
                <span className="text-[11px] tracking-[0.22em] uppercase text-(--olivea-olive)">
                  {label}
                </span>
              </div>

              {/* Animated text reveal */}
              <motion.div
                className="order-3 md:order-2 min-w-0 flex-1"
                variants={textVariants}
                initial={reduce ? false : "hidden"}
                animate={reduce ? undefined : "show"}
              >
                <p className="flex items-center gap-2 text-[13.5px] md:text-[14px] text-(--olivea-ink) opacity-95">
                  <span className="md:hidden h-1.5 w-1.5 shrink-0 rounded-full bg-(--olivea-olive)/55 olivea-banner-dot" />
                  <span className="sr-only md:hidden">{label}: </span>
                  <span className="truncate">{banner.text}</span>
                </p>
              </motion.div>

              {/* CTA — the reason the banner exists. Without this the notice was
                  a dead end: text and a dismiss button, nothing to act on. */}
              {banner.ctaHref && banner.ctaLabel ? (
                // On a phone the button is a round arrow, so the message keeps
                // the row; its words stay its accessible name.
                <Link
                  href={banner.ctaHref}
                  aria-label={banner.ctaLabel}
                  className="order-4 md:order-3 shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-(--olivea-olive) h-9 w-9 md:h-auto md:w-auto md:px-4 md:py-1.5 text-[12px] md:text-[12.5px] font-semibold uppercase tracking-[0.12em] text-(--olivea-cream) ring-1 ring-(--olivea-olive)/20 hover:bg-(--olivea-clay) transition-colors"
                >
                  <span className="hidden md:inline">{banner.ctaLabel}</span>
                  <span aria-hidden className="translate-y-[0.5px]">
                    →
                  </span>
                </Link>
              ) : null}
            </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
