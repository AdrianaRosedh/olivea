// components/navigation/AdaptiveNavbar.tsx
"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBackgroundColorDetection } from "@/hooks/useBackgroundColorDetection";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import OliveaFTTLogo from "@/assets/OliveaFTTIcon.svg";
import MenuToggle from "./MenuToggle";
import { cn } from "@/lib/utils";

export type DrawerOrigin = { x: number; y: number };

export type Props = {
  lang: "en" | "es";
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  className?: string;
  onDrawerOriginChange?: (origin: DrawerOrigin) => void;
};

const SCROLL_BG_START = 14; // px before navbar gains background (tweak 8–28)

export default function AdaptiveNavbar({
  lang,
  isDrawerOpen,
  onToggleDrawer,
  className,
  onDrawerOriginChange,
}: Props) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isJournal =
    pathname?.includes("/journal") ||
    pathname?.includes("/diario") ||
    pathname?.includes("/posts");

  const { isDark, elementRef, refreshBackgroundCheck } =
    useBackgroundColorDetection({
      mediaFallback: isJournal ? "never" : "previous",
      sampleUnderNavPx: 12,
    });

  const { clearTransition } = useSharedTransition();
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  /* ---------------- scroll-based background ---------------- */
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isMobile) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        setScrolled(y > SCROLL_BG_START);
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
  }, [isMobile, pathname]);

  /* ---------------- robust refresh ---------------- */
  const refreshNow = useCallback(() => {
    if (typeof window === "undefined") return;
    refreshBackgroundCheck();
    window.requestAnimationFrame(() => {
      refreshBackgroundCheck();
      window.requestAnimationFrame(() => refreshBackgroundCheck());
    });
  }, [refreshBackgroundCheck]);

  /* ---------------- freeze tone briefly after drawer close ---------------- */
  const [freezeTone, setFreezeTone] = useState(false);
  const freezeTimerRef = useRef<number | null>(null);
  const FREEZE_MS = 260;

  const lastStableDarkRef = useRef(isDark);
  useEffect(() => {
    if (!freezeTone) lastStableDarkRef.current = isDark;
  }, [isDark, freezeTone]);

  useEffect(() => {
    if (!isMobile) return;

    const onDrawerExit = () => {
      setFreezeTone(true);
      if (freezeTimerRef.current) window.clearTimeout(freezeTimerRef.current);
      freezeTimerRef.current = window.setTimeout(() => {
        setFreezeTone(false);
        freezeTimerRef.current = null;
      }, FREEZE_MS);

      refreshNow();
    };

    window.addEventListener("olivea:drawer-exit", onDrawerExit);
    return () => {
      window.removeEventListener("olivea:drawer-exit", onDrawerExit);
      if (freezeTimerRef.current) {
        window.clearTimeout(freezeTimerRef.current);
        freezeTimerRef.current = null;
      }
    };
  }, [isMobile, refreshNow]);

  useEffect(() => {
    if (!isMobile) return;
    if (!isDrawerOpen) {
      refreshNow();
      const t = window.setTimeout(() => refreshNow(), 140);
      return () => window.clearTimeout(t);
    }
  }, [isDrawerOpen, isMobile, refreshNow]);

  useEffect(() => {
    if (!isMobile) return;
    refreshNow();
  }, [lang, pathname, isMobile, refreshNow]);

  /* ---------------- measure MenuToggle center ---------------- */
  useLayoutEffect(() => {
    if (!isMobile) return;

    const measure = () => {
      const el = menuBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      onDrawerOriginChange?.({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      });
    };

    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(document.documentElement);
    } else {
      window.addEventListener("resize", measure);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
    };
  }, [isMobile, onDrawerOriginChange]);

  useEffect(() => {
    if (!isMobile || !isDrawerOpen) return;
    const t = window.setTimeout(() => {
      const el = menuBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      onDrawerOriginChange?.({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [isDrawerOpen, isMobile, onDrawerOriginChange]);

  /* ---------------- icon close-hold ---------------- */
  const [iconCloseHold, setIconCloseHold] = useState(false);
  const closeHoldTimer = useRef<number | null>(null);
  const ICON_CLOSE_HOLD_MS = 220;

  useEffect(() => {
    if (!isMobile) return;

    if (isDrawerOpen) {
      setIconCloseHold(false);
      if (closeHoldTimer.current) {
        window.clearTimeout(closeHoldTimer.current);
        closeHoldTimer.current = null;
      }
      return;
    }

    setIconCloseHold(true);
    if (closeHoldTimer.current) window.clearTimeout(closeHoldTimer.current);
    closeHoldTimer.current = window.setTimeout(() => {
      setIconCloseHold(false);
      closeHoldTimer.current = null;
    }, ICON_CLOSE_HOLD_MS);

    return () => {
      if (closeHoldTimer.current) {
        window.clearTimeout(closeHoldTimer.current);
        closeHoldTimer.current = null;
      }
    };
  }, [isDrawerOpen, isMobile]);

  if (!isMobile) return null;

  const darkForTone = freezeTone ? lastStableDarkRef.current : isDark;
  const baseTone = darkForTone ? "text-[#e7eae1]" : "text-(--olivea-olive)";

  const logoTone = isDrawerOpen ? "text-white" : baseTone;
  const iconTone = isDrawerOpen || iconCloseHold ? "text-white" : baseTone;

  const showBg = scrolled && !isDrawerOpen;

  // Outer stays full-width and always transparent
  // Inner becomes the rounded “glass pill” when showBg is true
  const pillClass = showBg
    ? cn(
        "mx-3 mt-2", // space from edges + a little down from top
        "rounded-2xl",
        "bg-(--olivea-cream)/72 backdrop-blur-md",
        "ring-1 ring-(--olivea-olive)/14",
        "shadow-[0_10px_30px_rgba(18,24,16,0.10)]"
      )
    : cn("mx-0 mt-0 bg-transparent");

  return (
    <div
      ref={elementRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-1000",
        "transition-[background-color,box-shadow,backdrop-filter] duration-200 ease-out",
        className
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Rounded background only when scrolled */}
      <div className={cn("transition-all duration-200 ease-out", pillClass)}>
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" aria-label="Home" onClick={() => clearTransition()}>
            <OliveaFTTLogo
              className={cn("h-10 w-auto transition-colors duration-150", logoTone)}
            />
          </Link>

          <MenuToggle
            toggle={onToggleDrawer}
            isOpen={isDrawerOpen}
            className={cn("transition-colors duration-150", iconTone)}
            buttonRef={menuBtnRef}
          />
        </div>
      </div>
    </div>
  );
}