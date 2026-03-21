"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useReservation } from "@/contexts/ReservationContext";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import { corm } from "@/app/fonts";
import { buildCenterNavItems, reserveDefault } from "@/lib/sections";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  lang: "en" | "es";
  /** @deprecated dictionary is no longer used — lang is derived from pathname */
  dictionary?: AppDictionary;
}

type CenterItem = {
  href: string;
  label: string;
  isActive: boolean;
};

const SCROLL_BG_START = 14;

/* ── Visual tokens ────────────────────────────────────────────────
   Derived from --olivea-olive (#5e7658) and --olivea-cream (#e7eae1).
   Centralized here so a palette change only needs one update.
   ──────────────────────────────────────────────────────────────── */
const TOKENS = {
  ink: "rgba(94,118,88,0.82)",       // olive at 82%
  light: "rgba(231,234,225,0.98)",   // cream at 98%
  ring: "rgba(94,118,88,0.30)",      // olive ring
  ringStrong: "rgba(94,118,88,0.42)",
  glassBg: "rgba(231,234,225,0.64)", // cream glass
  glassRing: "1px solid rgba(94,118,88,0.12)",
  glassShadow: "0 16px 44px rgba(18,24,16,0.10)",
  pillBg: "rgba(231,234,225,0.92)",
  pillBorder: "1px solid rgba(94,118,88,0.22)",
  pillShadow: "0 18px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(0,0,0,0.03)",
  sliderShadow: "0 10px 22px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.18)",
  hoverEase: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function Navbar({ lang: _langProp }: NavbarProps) {
  const pathname = usePathname() ?? "/es";
  const { openReservationModal } = useReservation();
  const { clearTransition } = useSharedTransition();

  const firstSeg = pathname.split("/")[1];
  const lang: "en" | "es" = firstSeg === "en" ? "en" : "es";
  const homeHref = lang === "en" ? "/en" : "/es";

  const center: CenterItem[] = useMemo(
    () => buildCenterNavItems(pathname),
    [pathname]
  );

  // Scroll flag (RAF throttled)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScrolled((window.scrollY || 0) > SCROLL_BG_START);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const showGlass = scrolled;

  const handleReserve = useCallback(() => {
    const id = reserveDefault(pathname);
    const map: Record<"casa" | "farmtotable" | "cafe", "hotel" | "restaurant" | "cafe"> = {
      casa: "hotel",
      farmtotable: "restaurant",
      cafe: "cafe",
    };
    openReservationModal(map[id]);
  }, [openReservationModal, pathname]);

  useEffect(() => {
    const onReserve = () => {
      if (window.matchMedia("(min-width: 768px)").matches) handleReserve();
    };
    window.addEventListener("olivea:reserve", onReserve);
    return () => window.removeEventListener("olivea:reserve", onReserve);
  }, [handleReserve]);

  const handleSameRouteCenterClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", window.location.pathname + window.location.search);
    },
    []
  );

  // --- Geometry / spacing
  const NAV_H = "clamp(80px, 9vh, 112px)";
  const LOGO_W = "clamp(96px, 10.5vw, 230px)";
  const INSET = 12; // px
  const RADIUS = 9999;

  // More space from top (works with fixed children)
  const TOP_GAP = 18; // px
  const TOP_OFFSET = `calc(env(safe-area-inset-top) + ${TOP_GAP}px)`;

  // Measure INNER pill surface + Reserve to size the glass (exclude logo)
  const reserveWrapRef = useRef<HTMLDivElement>(null);
  const pillsSurfaceRef = useRef<HTMLDivElement>(null);

  const [pillsRect, setPillsRect] = useState<DOMRect | null>(null);
  const [reserveRect, setReserveRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    if (pillsSurfaceRef.current) setPillsRect(pillsSurfaceRef.current.getBoundingClientRect());
    if (reserveWrapRef.current) setReserveRect(reserveWrapRef.current.getBoundingClientRect());
  }, []);

  // ResizeObserver: only fires when elements actually change size (replaces timers + resize listener)
  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (pillsSurfaceRef.current) ro.observe(pillsSurfaceRef.current);
    if (reserveWrapRef.current) ro.observe(reserveWrapRef.current);
    measure(); // initial read
    return () => ro.disconnect();
  }, [pathname, measure]);

  // Re-measure when glass toggles (scroll state change shifts layout)
  useEffect(() => {
    measure();
  }, [showGlass, measure]);

  // Glass style (soft entrance)

  const enter = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
  const exit = { opacity: 0, y: -6, scale: 0.992, filter: "blur(2px)" };

  // Glass should cover: inner pills surface + reserve only (exclude logo)
  const glassLeft = pillsRect ? Math.max(0, pillsRect.left - INSET) : undefined;
  const glassRight = reserveRect
    ? Math.max(0, window.innerWidth - (reserveRect.right + INSET))
    : undefined;

  const canShowGlass =
    showGlass && !!pillsRect && !!reserveRect && glassLeft != null && glassRight != null;

  // ---------------------------------------------------------------------------
  // ACTIVE SLIDER (single element that moves — avoids layoutId transform glitches)
  // ---------------------------------------------------------------------------
  const linkElsRef = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const registerLink = useCallback((href: string) => {
    return (node: HTMLAnchorElement | null) => {
      const map = linkElsRef.current;
      if (node) map.set(href, node);
      else map.delete(href);
    };
  }, []);

  const [activeRect, setActiveRect] = useState<{ x: number; w: number } | null>(null);

  const updateActiveRect = useCallback(() => {
    const surface = pillsSurfaceRef.current;
    if (!surface) return;

    const active = center.find((c) => c.isActive);
    if (!active) {
      setActiveRect(null);
      return;
    }

    const el = linkElsRef.current.get(active.href);
    if (!el) return;

    const s = surface.getBoundingClientRect();
    const r = el.getBoundingClientRect();

    const x = r.left - s.left;
    const w = r.width;

    setActiveRect({
      x: clamp(x, 0, Math.max(0, s.width - w)),
      w,
    });
  }, [center]);

  useLayoutEffect(() => {
    updateActiveRect();
    const t = window.setTimeout(updateActiveRect, 50);
    return () => window.clearTimeout(t);
  }, [pathname, updateActiveRect]);

  useEffect(() => {
    const onResize = () => updateActiveRect();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateActiveRect]);

  // Lifted hover state (single source instead of per-pill useState)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <nav
      data-scope="main"
      className="fixed left-0 right-0 z-50 bg-transparent"
      style={{ top: TOP_OFFSET }}
    >
      {/* Logo pinned LEFT */}
      <Link
        href={homeHref}
        aria-label="Home"
        onPointerDown={() => {
          try {
            sessionStorage.setItem("olivea:returning", "1");
          } catch {}
        }}
        onClick={() => clearTransition()}
        className="fixed z-60 pointer-events-auto"
        style={{
          top: TOP_OFFSET,
          left: "calc(var(--gutter) + env(safe-area-inset-left))",
        }}
      >
        <div
          className="relative"
          style={{
            width: LOGO_W,
            height: LOGO_W,
            marginTop: "clamp(2px, 0.9vh, 10px)",
          }}
        >
          <Image
            src="/brand/alebrije-1-Green.svg"
            alt="Olivea"
            fill
            className="object-contain"
            sizes="(min-width: 1440px) 230px, (min-width: 1024px) 200px, 150px"
            priority={false}
          />
        </div>
      </Link>

      {/* Reserve pinned RIGHT */}
      <motion.div
        data-scope="main"
        ref={reserveWrapRef}
        className="fixed z-60 pointer-events-auto"
        style={{
          top: TOP_OFFSET,
          right: "calc(var(--gutter) + env(safe-area-inset-right))",
          height: NAV_H,
          display: "flex",
          alignItems: "center",
        }}
        initial={false}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 46, mass: 0.8 }}
      >
        <button
          type="button"
          onClick={handleReserve}
          data-reserve-intent
          aria-label={lang === "en" ? "Reserve" : "Reservar"}
          className="olivea-reserve"
          style={{ width: "clamp(150px, 14vw, 210px)" }}
        >
          <span
            className={[
              corm.className,
              "uppercase font-semibold leading-none",
              "tracking-[0.18em]!",
              "text-[clamp(1.05rem,1.35vw,1.45rem)]",
            ].join(" ")}
            style={{ letterSpacing: "0.18em", color: "rgba(231,234,225,0.98)" }}
          >
            {lang === "en" ? "RESERVE" : "RESERVAR"}
          </span>
        </button>
      </motion.div>

      {/* Pills: ALWAYS centered */}
      <motion.div
        data-scope="main"
        className="fixed left-1/2 z-60 pointer-events-auto"
        style={{
          top: TOP_OFFSET,
          x: "-50%",
          height: NAV_H,
          display: "flex",
          alignItems: "center",
        }}
        initial={false}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 46, mass: 0.8 }}
      >
        <div className="inline-flex items-center">
          <div
            ref={pillsSurfaceRef}
            className="relative inline-flex items-center gap-2 rounded-full p-2"
            style={{
              background: TOKENS.pillBg,
              border: TOKENS.pillBorder,
              boxShadow: TOKENS.pillShadow,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {/* Active slider */}
            {activeRect ? (
              <motion.div
                aria-hidden
                className="absolute top-2 bottom-2 rounded-full"
                initial={false}
                animate={{ x: activeRect.x, width: activeRect.w }}
                transition={{
                  type: "tween",
                  ease: [0.16, 1, 0.3, 1],
                  duration: 0.22,
                }}
                style={{
                  left: 0,
                  background: "var(--olivea-olive)",
                  boxShadow: TOKENS.sliderShadow,
                }}
              />
            ) : null}

            {center.map((it) => (
              <CenterPillLink
                key={it.href}
                item={it}
                hovered={hoveredHref === it.href}
                onHover={setHoveredHref}
                onSameRouteClick={handleSameRouteCenterClick}
                registerLink={registerLink}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ONE glass surface ONLY behind inner pills + reserve button (NOT logo) */}
      <AnimatePresence>
        {canShowGlass ? (
          <motion.div
            key="olivea-nav-glass"
            aria-hidden
            className="fixed z-40 pointer-events-none"
            initial={exit}
            animate={enter}
            exit={exit}
            transition={{
              type: "tween",
              ease: [0.16, 1, 0.3, 1],
              duration: 0.32,
            }}
            style={{
              top: TOP_OFFSET,
              left: glassLeft,
              right: glassRight,
              height: NAV_H,
              display: "flex",
              alignItems: "center",
            }}
          >
            <motion.div
              style={{
                width: "100%",
                height: "calc(100% - 0px)",
                borderRadius: RADIUS,
                background: TOKENS.glassBg,
                border: TOKENS.glassRing,
                boxShadow: TOKENS.glassShadow,
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
              initial={false}
              animate={{
                boxShadow: showGlass
                  ? "0 18px 52px rgba(18,24,16,0.12)"
                  : TOKENS.glassShadow,
              }}
              transition={{ duration: 0.30, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}

function CenterPillLink({
  item,
  hovered,
  onHover,
  onSameRouteClick,
  registerLink,
}: {
  item: { href: string; label: string; isActive: boolean };
  hovered: boolean;
  onHover: (href: string | null) => void;
  onSameRouteClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  registerLink: (href: string) => (node: HTMLAnchorElement | null) => void;
}) {
  const { href, label, isActive } = item;
  const { ink, light, ring, ringStrong, hoverEase } = TOKENS;
  const refCb = useMemo(() => registerLink(href), [registerLink, href]);
  const localRef = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef(0);

  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!localRef.current) return;
    const clientX = e.clientX;
    if (rafRef.current) return; // skip if a frame is already queued
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      if (!localRef.current) return;
      const { left, width } = localRef.current.getBoundingClientRect();
      localRef.current.style.setProperty(
        "--hover-x",
        Math.round(((clientX - left) / width) * 100) + "%"
      );
    });
  };

  const showHoverRing = hovered && !isActive;

  return (
    <Link
      href={href}
      ref={(node) => {
        localRef.current = node;
        refCb(node);
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => onHover(href)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(href)}
      onBlur={() => onHover(null)}
      onClick={(e) => {
        if (isActive) onSameRouteClick(e);
      }}
      aria-current={isActive ? "page" : undefined}
      className={[
        "group relative isolate",
        "px-6 py-2.5 h-13 min-w-47.5 whitespace-nowrap",
        "rounded-full",
        "flex items-center justify-center",
        "font-medium text-base uppercase font-sans tracking-wide",
        "focus:outline-none",
      ].join(" ")}
      style={{ zIndex: 1 }} // above slider
    >
      {!isActive ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          initial={false}
          animate={{ opacity: showHoverRing ? 1 : 0 }}
          transition={{ duration: 0.18, ease: hoverEase }}
          style={{ boxShadow: `inset 0 0 0 1px ${ring}` }}
        />
      ) : null}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-focus-visible:opacity-100"
        style={{ boxShadow: `inset 0 0 0 2px ${ringStrong}` }}
      />

      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        initial={false}
        animate={{ opacity: hovered || isActive ? 1 : 0 }}
        transition={{ duration: 0.22, ease: hoverEase }}
        style={{
          background:
            "radial-gradient(240px circle at var(--hover-x, 50%) 50%, rgba(255,255,255,0.10), transparent 62%)",
          mixBlendMode: "soft-light",
        }}
      />

      <motion.span
        className="relative z-10"
        initial={false}
        animate={{ color: isActive ? light : ink }}
        transition={{ duration: 0.18, ease: hoverEase }}
        style={{
          textShadow: isActive
            ? "0 1px 10px rgba(0,0,0,0.20)"
            : "0 1px 10px rgba(0,0,0,0.08)",
        }}
      >
        {label}
      </motion.span>
    </Link>
  );
}