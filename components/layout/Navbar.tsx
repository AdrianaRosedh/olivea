// components/layout/Navbar.tsx
"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import OliveaFTTLogo from "@/assets/alebrije-1-Green.svg";
import MagneticButton from "@/components/ui/MagneticButton";
import { useReservation } from "@/contexts/ReservationContext";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import { corm } from "@/app/fonts";
import { buildCenterNavItems, reserveDefault } from "@/lib/sections";
import { motion } from "framer-motion";

interface CenterLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onSameRouteClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function CenterLink({ href, label, isActive, onSameRouteClick }: CenterLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    ref.current.style.setProperty(
      "--hover-x",
      Math.round(((e.clientX - left) / width) * 100) + "%"
    );
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive && onSameRouteClick) onSameRouteClick(e);
  };

  // Olivea-native text colors (no black/white)
  const ink = "rgba(94,118,88,0.78)";
  const light = "rgba(231,234,225,0.96)";

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={onMouseMove}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={[
        "group relative",
        "px-6 py-2.5 h-13 min-w-47.5 whitespace-nowrap",
        "rounded-full",
        "flex items-center justify-center",
        "font-medium text-base uppercase font-sans tracking-wide",
        "transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10",
      ].join(" ")}
    >
      {/* Hover background wash (green) — only for inactive items */}
      {!isActive ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          initial={false}
          animate={{ opacity: 0 }}
          whileHover={{
            opacity: 1,
            transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
          }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "var(--olivea-olive)" }}
        />
      ) : null}

      {/* Active background (green) — stays on when on page */}
      {isActive ? (
        <motion.span
          layoutId="olivea-center-active"
          aria-hidden
          className="absolute inset-0 rounded-full"
          transition={{ type: "spring", stiffness: 520, damping: 46, mass: 0.7 }}
          style={{
            background: "var(--olivea-olive)",
            boxShadow:
              "0 12px 26px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.18)",
          }}
        />
      ) : null}

      {/* Subtle hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(240px circle at var(--hover-x, 50%) 50%, rgba(255,255,255,0.12), transparent 62%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* LABEL */}
      <span className="relative z-10">
        {/* Inactive ink */}
        <span
          className={[
            "absolute inset-0 flex items-center justify-center",
            "transition-opacity duration-200",
            isActive ? "opacity-0" : "opacity-100 group-hover:opacity-0",
          ].join(" ")}
          style={{ color: ink }}
        >
          {label}
        </span>

        {/* Light tint for hover + active */}
        <span
          className={[
            "flex items-center justify-center",
            "transition-opacity duration-200",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          ].join(" ")}
          style={{ color: light }}
        >
          {label}
        </span>
      </span>
    </Link>
  );
}

interface NavbarProps {
  lang: "en" | "es";
  dictionary: AppDictionary;
}

/**
 * ✅ Desktop-only Navbar
 * Mobile navbar (AdaptiveNavbar + MobileDrawer + MobileNav) lives in `components/layout/MobileNavbar.tsx`.
 * This split prevents mobile from downloading desktop navbar code and vice-versa.
 */
export default function Navbar({ lang: _langProp }: NavbarProps) {
  const pathname = usePathname() ?? "/es";
  const { openReservationModal } = useReservation();
  const { clearTransition } = useSharedTransition();

  // 🔑 derive lang from URL path
  const firstSeg = pathname.split("/")[1];
  const lang: "en" | "es" = firstSeg === "en" ? "en" : "es";

  const homeHref = lang === "en" ? "/en" : "/es";

  // Build center items from the single source of truth
  const center = buildCenterNavItems(pathname);

  // Reserve button handler — default tab derived from path
  const handleReserve = useCallback(() => {
    const id = reserveDefault(pathname); // "casa" | "farmtotable" | "cafe"
    const map: Record<"casa" | "farmtotable" | "cafe", "hotel" | "restaurant" | "cafe"> =
      {
        casa: "hotel",
        farmtotable: "restaurant",
        cafe: "cafe",
      };
    openReservationModal(map[id]);
  }, [openReservationModal, pathname]);

  // Desktop-only reserve event (kept exactly as you had it)
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

      type LenisScrollOpts = {
        offset?: number;
        duration?: number;
        lock?: boolean;
        force?: boolean;
        easing?: (t: number) => number;
      };
      type LenisLike = {
        scrollTo: (t: HTMLElement | number | string, o?: LenisScrollOpts) => void;
      };

      const w = window as unknown as Window & { lenis?: LenisLike; Lenis?: LenisLike };
      const lenis: LenisLike | null = w.lenis ?? w.Lenis ?? null;

      const scroller = (document.scrollingElement || document.documentElement) as HTMLElement;
      const prevSnap = scroller.style.scrollSnapType;
      scroller.style.scrollSnapType = "none";

      const currentTop = () => (document.scrollingElement?.scrollTop ?? window.scrollY ?? 0);
      const y0 = currentTop();
      const distance = Math.abs(y0 - 0);
      const DURATION_MS = Math.round(Math.min(1600, Math.max(800, distance * 0.6)));
      const DURATION_S = DURATION_MS / 1000;

      const easeInOutQuint = (t: number) =>
        t < 0.5 ? 16 * t ** 5 : 1 - ((-2 * t + 2) ** 5) / 2;

      const overshootPx = Math.min(24, Math.max(8, distance * 0.015));

      const THRESH = 0.5;
      const STABLE_FRAMES = 2;
      const TIMEOUT = DURATION_MS + 600;
      const start = performance.now();
      let stable = 0;
      let rafId = 0;

      const arrivedNow = () => currentTop() <= THRESH;

      const tick = () => {
        if (arrivedNow()) stable += 1;
        else stable = 0;

        const expired = performance.now() - start > TIMEOUT;
        if (stable >= STABLE_FRAMES || expired) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
          scroller.style.scrollSnapType = prevSnap;
          return;
        }
        rafId = requestAnimationFrame(tick);
      };

      const animateToTop = (durationMs: number) => {
        const yStart = currentTop();
        const yOvershoot = -overshootPx;
        const t0 = performance.now();

        const step1 = (now: number) => {
          const t = Math.min(1, (now - t0) / durationMs);
          const y = yStart + (yOvershoot - yStart) * easeInOutQuint(t);
          window.scrollTo(0, y);

          if (t < 1) requestAnimationFrame(step1);
          else {
            const settleMs = Math.min(220, Math.max(140, durationMs * 0.18));
            const s0 = performance.now();
            const ySettleStart = currentTop();

            const step2 = (now2: number) => {
              const tt = Math.min(1, (now2 - s0) / settleMs);
              const y2 = ySettleStart + (0 - ySettleStart) * easeInOutQuint(tt);
              window.scrollTo(0, y2);
              if (tt < 1) requestAnimationFrame(step2);
            };

            requestAnimationFrame(step2);
          }
        };

        requestAnimationFrame(step1);
      };

      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0, {
          duration: DURATION_S,
          lock: true,
          force: true,
          easing: easeInOutQuint,
        });
      } else {
        animateToTop(DURATION_MS);
      }

      rafId = requestAnimationFrame(tick);

      const cleanup = () => {
        cancelAnimationFrame(rafId);
        scroller.style.scrollSnapType = prevSnap;
        window.removeEventListener("pagehide", cleanup);
        window.removeEventListener("visibilitychange", visHandler);
      };

      const visHandler = () => {
        if (document.visibilityState === "hidden") cleanup();
      };

      window.addEventListener("pagehide", cleanup);
      window.addEventListener("visibilitychange", visHandler);
    },
    []
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="relative w-full h-20 md:h-24 lg:h-28">
        {/* Left: Logo */}
        <Link
          href={homeHref}
          aria-label="Home"
          onPointerDown={() => {
            try {
              sessionStorage.setItem("olivea:returning", "1");
            } catch {}
          }}
          onClick={() => {
            clearTransition();
          }}
          className="absolute left-4 md:left-8 lg:left-12 md:top-6 lg:top-6 inline-flex items-center"
        >
          <OliveaFTTLogo
            className="h-14 md:h-22 lg:h-40 w-auto transition-all duration-300"
            style={{ maxHeight: "16rem" }}
          />
        </Link>

        {/* Center: 3 buttons */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-nav">
          <div
            className="relative inline-flex items-center gap-2 rounded-full p-2"
            style={{
              background: "rgba(231,234,225,0.92)",
              border: "1px solid rgba(94,118,88,0.28)",
              boxShadow:
                "0 18px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(0,0,0,0.03)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {center.map((it) => (
              <CenterLink
                key={it.href}
                href={it.href}
                label={it.label}
                isActive={it.isActive}
                onSameRouteClick={handleSameRouteCenterClick}
              />
            ))}
          </div>
        </div>

        {/* Right: Reserve */}
        <div className="absolute right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2">
          <MagneticButton
            onClick={handleReserve}
            data-reserve-intent
            aria-label={lang === "en" ? "Reserve" : "Reservar"}
            className="bg-(--olivea-olive) text-white px-6 py-2.5 h-15 rounded-md hover:bg-(--olivea-clay) transition-colors"
          >
            <span
              className={[
                corm.className,
                "uppercase font-semibold leading-none",
                "tracking-[0.18em]!",
                "text-[clamp(1.05rem,1.35vw,1.45rem)]",
              ].join(" ")}
              style={{ letterSpacing: "0.18em" }}
            >
              {lang === "en" ? "RESERVE" : "RESERVAR"}
            </span>
          </MagneticButton>
        </div>
      </div>
    </nav>
  );
}
