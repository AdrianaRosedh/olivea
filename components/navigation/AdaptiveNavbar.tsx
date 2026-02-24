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
import MenuToggle from "./MenuToggle";
import { cn } from "@/lib/utils";

export type DrawerOrigin = { x: number; y: number };

export type Props = {
  lang: "en" | "es";
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  className?: string;
  onDrawerOriginChange?: (origin: DrawerOrigin) => void;

  /**
   * ✅ NEW:
   * Force-enable the AdaptiveNavbar even when viewport >= 768px.
   * Use this when LayoutShell decides "mobile-like" by container width.
   */
  enabled?: boolean;
};

const SCROLL_BG_START = 14; // px before navbar gains background (tweak 8–28)

export default function AdaptiveNavbar({
  lang,
  isDrawerOpen,
  onToggleDrawer,
  className,
  onDrawerOriginChange,
  enabled,
}: Props) {
  const pathname = usePathname();

  // default behavior = true mobile only
  const isMobileViewport = useIsMobile();

  // ✅ final gate: either forced by container breakpoint OR true mobile viewport
  const isMobileLike = enabled ?? isMobileViewport;

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
    if (!isMobileLike) return;

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
  }, [isMobileLike, pathname]);

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
    if (!isMobileLike) return;

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
  }, [isMobileLike, refreshNow]);

  useEffect(() => {
    if (!isMobileLike) return;
    if (!isDrawerOpen) {
      refreshNow();
      const t = window.setTimeout(() => refreshNow(), 140);
      return () => window.clearTimeout(t);
    }
  }, [isDrawerOpen, isMobileLike, refreshNow]);

  useEffect(() => {
    if (!isMobileLike) return;
    refreshNow();
  }, [lang, pathname, isMobileLike, refreshNow]);

  /* ---------------- measure MenuToggle center ---------------- */
  useLayoutEffect(() => {
    if (!isMobileLike) return;

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
  }, [isMobileLike, onDrawerOriginChange]);

  useEffect(() => {
    if (!isMobileLike || !isDrawerOpen) return;
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
  }, [isDrawerOpen, isMobileLike, onDrawerOriginChange]);

  /* ---------------- icon close-hold ---------------- */
  const [iconCloseHold, setIconCloseHold] = useState(false);
  const closeHoldTimer = useRef<number | null>(null);
  const ICON_CLOSE_HOLD_MS = 220;

  useEffect(() => {
    if (!isMobileLike) return;

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
  }, [isDrawerOpen, isMobileLike]);

  // ✅ the actual render gate
  if (!isMobileLike) return null;

  const darkForTone = freezeTone ? lastStableDarkRef.current : isDark;
  const baseTone = darkForTone ? "text-[#e7eae1]" : "text-(--olivea-olive)";
  const iconTone = isDrawerOpen || iconCloseHold ? "text-white" : baseTone;

  const showBg = scrolled && !isDrawerOpen;

  const pillClass = showBg
    ? cn(
        "mx-3 mt-2",
        "rounded-2xl",
        "bg-(--olivea-cream)/72 backdrop-blur-md",
        "ring-1 ring-(--olivea-olive)/14",
        "shadow-[0_10px_30px_rgba(18,24,16,0.10)]"
      )
    : cn("mx-0 mt-0 bg-transparent");

  const logoColor = isDrawerOpen
    ? "#ffffff"
    : darkForTone
      ? "#e7eae1"
      : "var(--olivea-olive)";

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
      <div className={cn("transition-all duration-200 ease-out", pillClass)}>
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" aria-label="Home" onClick={() => clearTransition()}>
            <span className="sr-only">Olivea</span>
            <div
              aria-hidden="true"
              className="h-10 w-10"
              style={{
                backgroundColor: logoColor,
                WebkitMaskImage: "url(/brand/OliveaFTTIcon.svg)",
                maskImage: "url(/brand/OliveaFTTIcon.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
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