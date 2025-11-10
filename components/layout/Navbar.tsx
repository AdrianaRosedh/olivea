"use client";

import { useState, useCallback, useRef, MouseEvent, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import OliveaFTTLogo from "@/assets/alebrije-1-Green.svg";
import MagneticButton from "@/components/ui/MagneticButton";
import { useReservation } from "@/contexts/ReservationContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import AdaptiveNavbar from "@/components/navigation/AdaptiveNavbar";
import MobileDrawer from "@/components/navigation/MobileDrawer";
import { MobileNav } from "@/components/navigation/MobileNav";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import { corm } from "@/app/fonts";

// ✅ centralized section helpers
import { buildCenterNavItems, reserveDefault } from "@/lib/sections";

/* ---------------------------------- */
/* CenterLink */
/* ---------------------------------- */
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
    ref.current.style.setProperty("--hover-x", Math.round(((e.clientX - left) / width) * 100) + "%");
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive && onSameRouteClick) onSameRouteClick(e);
  };

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={onMouseMove}
      onClick={onClick}
      className={`relative px-6 py-2.5 h-[52px] min-w-[190px] whitespace-nowrap rounded-md
                  flex items-center justify-center font-medium text-base uppercase font-sans tracking-wide
                  ${isActive ? "active" : ""}`}
    >
      {label}
    </Link>
  );
}

/* ---------------------------------- */
/* Navbar */
/* ---------------------------------- */
interface NavbarProps {
  lang: "en" | "es";
  dictionary: AppDictionary;
}

export default function Navbar({ lang, dictionary }: NavbarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { openReservationModal } = useReservation();
  const { clearTransition } = useSharedTransition();
  const homeHref = lang === "en" ? "/en" : "/es";

  // Build center items from the single source of truth
  const center = buildCenterNavItems(pathname); // [{id, href, isActive, label}, …]

  // mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = useCallback(() => {
    navigator.vibrate?.(10);
    setDrawerOpen((v) => !v);
  }, []);

  // Reserve button handler — default tab derived from path
  const handleReserve = useCallback(() => {
    const id = reserveDefault(pathname); // "casa" | "farmtotable" | "cafe"
    const map: Record<"casa" | "farmtotable" | "cafe", "hotel" | "restaurant" | "cafe"> = {
      casa: "hotel",
      farmtotable: "restaurant",
      cafe: "cafe",
    };
    openReservationModal(map[id]);
  }, [openReservationModal, pathname]);

  // desktop "olivea:reserve" global event
  useEffect(() => {
    const onReserve = () => {
      if (window.matchMedia("(min-width: 768px)").matches) handleReserve();
    };
    window.addEventListener("olivea:reserve", onReserve);
    return () => window.removeEventListener("olivea:reserve", onReserve);
  }, [handleReserve]);

  /* ---------------------------------- */
  /* Smooth scroll back to #hero on same-route click */
  /* ---------------------------------- */
  const handleSameRouteCenterClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    type LenisScrollOpts = { offset?: number; duration?: number; lock?: boolean; force?: boolean; easing?: (t: number) => number; };
    type LenisLike = { scrollTo: (t: HTMLElement | number | string, o?: LenisScrollOpts) => void };
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

    const easeInOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - ((-2 * t + 2) ** 5) / 2);
    const overshootPx = Math.min(24, Math.max(8, distance * 0.015));

    const THRESH = 0.5;
    const STABLE_FRAMES = 2;
    const TIMEOUT = DURATION_MS + 600;
    const start = performance.now();
    let stable = 0;
    let rafId = 0;

    const arrivedNow = () => currentTop() <= THRESH;

    const tick = () => {
      if (arrivedNow()) stable += 1; else stable = 0;
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
      lenis.scrollTo(0, { duration: DURATION_S, lock: true, force: true, easing: easeInOutQuint });
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
    const visHandler = () => { if (document.visibilityState === "hidden") cleanup(); };
    window.addEventListener("pagehide", cleanup);
    window.addEventListener("visibilitychange", visHandler);
  }, []);

  /* ---------------------------------- */
  /* Mobile UI */
  /* ---------------------------------- */
  if (isMobile) {
    return (
      <>
        <AdaptiveNavbar lang={lang} isDrawerOpen={drawerOpen} onToggleDrawer={toggleDrawer} />
        <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} lang={lang} dict={dictionary} />
        <MobileNav />
      </>
    );
  }

  /* ---------------------------------- */
  /* Desktop UI */
  /* ---------------------------------- */
  return (
    <nav className="fixed top-0 left-0 right-0 z-[50] bg-transparent">
      <div className="relative w-full h-20 md:h-24 lg:h-28">
        {/* Left: Logo */}
        <Link
          href={homeHref}
          aria-label="Home"
          onPointerDown={() => { try { sessionStorage.setItem("olivea:returning", "1"); } catch {} }}
          onClick={() => { clearTransition(); }}
          className="absolute left-4 md:left-8 lg:left-12 top-[1rem] md:top-[1.5rem] lg:top-[1.5rem] inline-flex items-center"
        >
          <OliveaFTTLogo className="h-14 md:h-22 lg:h-40 w-auto transition-all duration-300" style={{ maxHeight: "16rem" }} />
        </Link>

        {/* Center: 3 buttons */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 fill-nav">
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

        {/* Right: Reserve */}
        <div className="absolute right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2">
          <MagneticButton
            onClick={handleReserve}
            data-reserve-intent  // helps prewarm the modal bundle
            aria-label={lang === "en" ? "Reserve" : "Reservar"}
            className="bg-[var(--olivea-olive)] text-white px-6 py-2.5 h-[60px] rounded-md hover:bg-[var(--olivea-clay)] transition-colors"
          >
            <span
              className={[
                corm.className,
                "uppercase font-semibold leading-none",
                "!tracking-[0.18em] [letter-spacing:0.18em]",
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