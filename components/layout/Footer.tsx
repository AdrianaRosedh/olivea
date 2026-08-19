"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import { AnimatePresence, motion } from "framer-motion";
import { GlobeIcon } from "lucide-react";
import {
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
  LinkedInIcon,
  SpotifyIcon,
  PinterestIcon,
} from "@/components/icons/SocialIcons";
import type { AppDictionary } from "@/app/[lang]/(main)/dictionaries";

interface FooterProps {
  dict: AppDictionary;
  socials?: { platform: string; url: string; label: string }[];
}

// Map social platform name → inline SVG icon component.
// Used to render socials passed in from global_settings.
const SOCIAL_ICON_MAP: Record<string, ReactNode> = {
  youtube: <YouTubeIcon />,
  instagram: <InstagramIcon />,
  tiktok: <TikTokIcon />,
  linkedin: <LinkedInIcon />,
  spotify: <SpotifyIcon />,
  pinterest: <PinterestIcon />,
};

const FALLBACK_SOCIALS: SocialItem[] = [
  { id: "yt", href: "https://www.youtube.com/@GrupoOlivea", label: "YouTube", icon: <YouTubeIcon /> },
  { id: "ig", href: "https://instagram.com/oliveafarmtotable/", label: "Instagram", icon: <InstagramIcon /> },
  { id: "tt", href: "https://www.tiktok.com/@familiaolivea", label: "TikTok", icon: <TikTokIcon /> },
  { id: "li", href: "https://www.linkedin.com/company/inmobiliaria-casa-olivea/", label: "LinkedIn", icon: <LinkedInIcon /> },
  { id: "sp", href: "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8", label: "Spotify", icon: <SpotifyIcon /> },
  { id: "pt", href: "https://mx.pinterest.com/familiaolivea/", label: "Pinterest", icon: <PinterestIcon /> },
];

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

export default function Footer({ dict, socials }: FooterProps) {
  const pathname = usePathname() ?? "/es";

  const firstSeg = pathname.split("/")[1];
  const lang: "en" | "es" = firstSeg === "en" ? "en" : "es";

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // The footer is position:fixed, so it covers whatever sits at the bottom of
  // the viewport — the cookie banner was landing on top of it. Its height is
  // not a constant either: 77px on desktop, 133px on mobile where the links
  // wrap, and it changes again if links are added. Publishing the measured
  // height lets anything anchored to the bottom clear it without hardcoding a
  // number that silently goes stale.
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--footer-h",
        `${Math.round(el.getBoundingClientRect().height)}px`
      );
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--footer-h");
    };
  }, []);

  // Keep the bar on one line.
  //
  // At the narrowest width the footer renders at (960px — below that
  // LayoutShell swaps in the mobile nav) the three groups want about 1060px,
  // so the links wrapped underneath the language button and the bar silently
  // became two rows. The social icons were the worst offender: their
  // clamp(30px, 6.8vw, 36px) sizing is pinned to the 36px maximum everywhere
  // above ~530px, so they never gave any width back.
  //
  // Rather than dropping items, scale type, icons and gaps together by a
  // measured factor. Each group's own scrollWidth is its natural single-line
  // width, which makes the measurement independent of how the row is laid out,
  // and the loop converges because every pass multiplies by a factor < 1.
  useEffect(() => {
    const row = rowRef.current;
    const footer = footerRef.current;
    if (!row || !footer) return;

    // Below this, type stops being readable — accept a clip instead.
    const FLOOR = 0.72;
    let raf = 0;
    let lastWidth = -1;

    const naturalWidth = () =>
      [leftRef.current, centerRef.current, rightRef.current].reduce(
        (sum, el) => sum + (el?.scrollWidth ?? 0),
        0
      );

    const fit = () => {
      raf = 0;
      // Always re-measure from full density, otherwise the bar can only ever
      // shrink and would stay tiny after the window is widened again.
      footer.style.setProperty("--fd", "1");
      const available = row.clientWidth;
      if (available <= 0) return;

      let d = 1;
      for (let i = 0; i < 4; i++) {
        const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
        const needed = naturalWidth() + gap * 2;
        if (needed <= available) break;
        d = Math.max(FLOOR, d * (available / needed));
        footer.style.setProperty("--fd", String(d));
        if (d <= FLOOR) break;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(fit);
    };

    fit();

    // Width only: --fd changes the bar's height, and reacting to that would
    // feed back into itself.
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      if (w === lastWidth) return;
      lastWidth = w;
      schedule();
    });
    ro.observe(row);

    // Webfonts land after first paint and change every text width.
    document.fonts?.ready.then(schedule).catch(() => {});

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const [lift, setLift] = useState(0);

  // subtle one-time attention to language toggle
  const [hintLang, setHintLang] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setHintLang(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("pointerdown", handleClickOutside);
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

    setOpen(false);
    fadeNavigate(newPath);
  };

  const rightsText = lang === "en" ? "All rights reserved" : "Todos los derechos reservados";

  // Prefer admin-edited socials from global_settings; fall back to defaults.
  const socialItems: SocialItem[] = socials && socials.length > 0
    ? socials.map((s, i) => ({
        id: s.platform || `s${i}`,
        href: s.url,
        label: s.label || s.platform,
        icon: SOCIAL_ICON_MAP[s.platform.toLowerCase()] ?? <InstagramIcon />,
      }))
    : FALLBACK_SOCIALS;

  // Shared footer text-link. Renders a <button> when given onClick (e.g. the
  // cookie-preferences trigger) and a <Link> otherwise, so every footer item
  // shares the exact same styling, hover lift, and animated underline.
  const TextLink = ({
    href,
    onClick,
    children,
  }: {
    href?: string;
    onClick?: () => void;
    children: ReactNode;
  }) => {
    const className = [
      "group relative inline-flex items-center",
      "opacity-80 hover:opacity-100",
      "transition-[opacity,transform,color] duration-200",
      "hover:-translate-y-px",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/40",
    ].join(" ");
    const inner = (
      <>
        <span className="text-(--olivea-olive)">{children}</span>
        <span
          className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{
            background:
              "linear-gradient(90deg, rgba(94,118,88,0.0), rgba(94,118,88,0.65), rgba(94,118,88,0.0))",
          }}
        />
      </>
    );
    return onClick ? (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    ) : (
      <Link href={href ?? "#"} className={className}>
        {inner}
      </Link>
    );
  };

  return (
    <footer
      ref={footerRef}
      className={[
        "fixed bottom-0 left-0 w-full z-200",
        "bg-transparent backdrop-blur-md",
        "text-(--olivea-ink) font-light tracking-wide pointer-events-auto isolate",
      ].join(" ")}
      style={{
        // safe-area padding for iPhone bottoms (also gives breathing room)
        paddingBottom: "calc(env(safe-area-inset-bottom) + 2px)",
        // NB: --fd is deliberately NOT declared here. The fit effect owns it
        // via setProperty, and a value in this object would be re-applied on
        // every React render — silently resetting the density back to 1 the
        // next time any other state in this component changes. Consumers use
        // var(--fd, 1) so the default still holds before the effect runs.
        fontSize: "max(9.5px, calc(12px * var(--fd, 1)))",
      }}
    >
      {/* subtle top divider haze */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px opacity-70"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(94,118,88,0.25), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Inner container:
          - On small screens: stack + wrap
          - On md+: 3 columns
      */}
      {/* One row, always. The side groups are content-sized and the middle
          column is content-sized too, so the social dock sits at true centre
          while the 1fr gutters absorb the difference. Nothing wraps — the fit
          effect scales the whole bar down instead. */}
      <div
        ref={rowRef}
        className="grid w-full items-center px-2 sm:px-3 py-2"
        style={{
          // max-content floors stop a group from being squeezed narrower than
          // its text: with a plain 1fr the side groups overflowed their tracks
          // and printed straight over the social icons — 102px of overlap at
          // 1024px, which looks worse than the wrap it replaced. This way the
          // row overflows honestly instead, and the fit effect removes it.
          gridTemplateColumns:
            "minmax(max-content, 1fr) auto minmax(max-content, 1fr)",
          columnGap: "max(8px, calc(16px * var(--fd, 1)))",
        }}
      >
        {/* LEFT: language + links */}
        <div
          ref={leftRef}
          className="flex min-w-0 items-center justify-self-start whitespace-nowrap"
        >
          <div
            className="relative flex flex-nowrap items-center whitespace-nowrap"
            ref={dropdownRef}
            style={{
              transform: lift ? `translateY(-${lift}px)` : undefined,
              transition: "transform 200ms ease",
              gap: "max(6px, calc(10px * var(--fd, 1)))",
            }}
          >
            {/* Language toggle */}
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
                "group relative flex items-center gap-1.5",
                // smaller padding on tiny screens
                "px-2 py-1.5 sm:px-3",
                "rounded-md text-[0.95em] font-medium",
                "transition-[transform,box-shadow,background-color,color,border-color] duration-200",
                "border border-[rgba(0,0,0,0.06)]",
                "hover:bg-(--olivea-olive) hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/40",
                // never let it be too wide
                "max-w-40",
              ].join(" ")}
              style={{
                boxShadow: open || hintLang ? "0 0 0 3px rgba(94,118,88,0.16)" : undefined,
              }}
            >
              <span
                className="absolute -left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
                style={{
                  background: "rgba(94,118,88,0.85)",
                  opacity: open ? 0.95 : 0.55,
                }}
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -inset-2 rounded-xl opacity-0 transition-opacity duration-300"
                style={{
                  opacity: open ? 1 : hintLang ? 0.55 : 0,
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(94,118,88,0.18), rgba(94,118,88,0.0) 65%)",
                }}
                aria-hidden="true"
              />
              <GlobeIcon className="w-4 h-4 text-current transition-colors shrink-0" />
              {lang.toUpperCase()}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  onPointerDown={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className={[
                    "absolute bottom-full mb-2 left-0",
                    "bg-[#e7eae1] backdrop-blur-md",
                    "border border-gray-200 rounded-md shadow-lg",
                    "z-500 w-32 pointer-events-auto overflow-hidden",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => switchLocale("en")}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-(--olivea-olive) hover:text-white transition-colors"
                  >
                    🇺🇸 English
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLocale("es")}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-(--olivea-olive) hover:text-white transition-colors"
                  >
                    🇲🇽 Español
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <nav
              aria-label="Footer navigation"
              className="flex flex-nowrap items-center whitespace-nowrap"
              style={{ gap: "max(7px, calc(14px * var(--fd, 1)))" }}
            >
              <TextLink href={`/${lang}/carreras`}>{dict.footer.careers}</TextLink>
              <TextLink href={`/${lang}/legal`}>{dict.footer.legal}</TextLink>
              {/* Reopens the cookie-consent banner so consent can be changed/withdrawn */}
              <TextLink onClick={() => window.dispatchEvent(new Event("olivea:cookie-prefs"))}>
                Cookies
              </TextLink>
              {/* roseiies — brand wordmark masked in Olivea green, slightly emphasized */}
              <Link
                href={`/${lang}/roseiies`}
                aria-label="roseiies"
                className="group relative inline-flex items-center opacity-100 transition-[opacity,transform] duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/40"
              >
                <span
                  aria-hidden="true"
                  className="inline-block bg-(--olivea-olive)"
                  style={{
                    height: "1.3em",
                    width: "5.92em",
                    maskImage: "url(/images/roseiies-logo.svg)",
                    WebkitMaskImage: "url(/images/roseiies-logo.svg)",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
              </Link>
            </nav>
          </div>
        </div>

        {/* CENTER: social dock — content-sized so it stays truly centred */}
        <div ref={centerRef} className="flex min-w-0 items-center justify-self-center">
          <FooterSocialDock items={socialItems} />
        </div>

        {/* RIGHT: rights */}
        <div
          ref={rightRef}
          className="min-w-0 justify-self-end whitespace-nowrap text-right leading-snug opacity-80"
        >
          <span className="cursor-default transition-colors hover:text-(--olivea-olive)">
            <span>© {new Date().getFullYear()} Inmobiliaria MYA by DH.</span>
            <span className="mx-1 inline-block align-middle opacity-60">•</span>
            <span>{rightsText}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

/** --- Footer Social Dock --- */
function FooterSocialDock({ items }: { items: SocialItem[] }) {
  return (
    // Never wraps: with six icons, wrapping is what pushed the bar to a second
    // line. They shrink with --fd instead.
    <div
      className="flex flex-nowrap items-center justify-center"
      style={{ gap: "max(3px, calc(11px * var(--fd, 1)))" }}
    >
      {items.map((it) => (
        <FooterSocialIcon key={it.id} item={it} />
      ))}
    </div>
  );
}

function FooterSocialIcon({ item }: { item: SocialItem }) {
  // Sized off the bar's density factor rather than the viewport. The old
  // clamp(…, 6.8vw, …) sat at its 36px ceiling for every width the footer
  // actually renders at, so widening or narrowing the window changed nothing.
  const CELL = "max(22px, calc(34px * var(--fd, 1)))";
  const ICON = "max(14px, calc(21px * var(--fd, 1)))";

  return (
    <motion.a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={[
        "flex items-center justify-center",
        "text-(--olivea-olive) opacity-85 hover:opacity-100",
        "transition-[opacity,transform]",
        "rounded-full",
      ].join(" ")}
      style={{
        width: CELL,
        height: CELL,
      }}
    >
      <motion.span
        variants={{
          rest: { scale: 1.0, filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" },
          hover: { scale: 1.14, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" },
        }}
        transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.2 }}
        className="leading-none"
        style={{ fontSize: ICON }}
      >
        {item.icon}
      </motion.span>
    </motion.a>
  );
}