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
      // keep default stableSamples=3 in the hook (recommended)
    });

  const { clearTransition } = useSharedTransition();
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

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

  // Track last "trusted" isDark (used during freeze)
  const lastStableDarkRef = useRef(isDark);
  useEffect(() => {
    if (!freezeTone) lastStableDarkRef.current = isDark;
  }, [isDark, freezeTone]);

  // ✅ refresh when drawer fully unmounts (MobileDrawer dispatches this)
  useEffect(() => {
    if (!isMobile) return;

    const onDrawerExit = () => {
      // Freeze briefly to avoid “one-frame wrong sample” during clip-path shrink
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

  // fallback refresh on close state flip
  useEffect(() => {
    if (!isMobile) return;
    if (!isDrawerOpen) {
      refreshNow();
      const t = window.setTimeout(() => refreshNow(), 140);
      return () => window.clearTimeout(t);
    }
  }, [isDrawerOpen, isMobile, refreshNow]);

  // route/lang refresh
  useEffect(() => {
    if (!isMobile) return;
    refreshNow();
  }, [lang, pathname, isMobile, refreshNow]);

  /* ---------------- measure MenuToggle center (clip-path origin) ---------------- */
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

  // re-measure right as drawer opens
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

  /* ---------------- icon close-hold (X→hamburger morph timing) ---------------- */
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

  // ✅ Use last stable value during freeze window
  const darkForTone = freezeTone ? lastStableDarkRef.current : isDark;
  const baseTone = darkForTone ? "text-[#e7eae1]" : "text-(--olivea-olive)";

  // Logo updates immediately on close (after drawer-exit refresh), without flicker
  const logoTone = isDrawerOpen ? "text-white" : baseTone;

  // Icon stays white a bit longer after close so morph feels synced
  const iconTone = isDrawerOpen || iconCloseHold ? "text-white" : baseTone;

  return (
    <div
      ref={elementRef}
      className={cn("fixed top-0 left-0 right-0 z-1000 bg-transparent", className)}
    >
      <div className="flex items-center justify-between px-4 h-16">
        <Link href="/" aria-label="Home" onClick={() => clearTransition()}>
          <OliveaFTTLogo className={cn("h-10 w-auto", logoTone)} />
        </Link>

        <MenuToggle
          toggle={onToggleDrawer}
          isOpen={isDrawerOpen}
          className={iconTone}
          buttonRef={menuBtnRef}
        />
      </div>
    </div>
  );
}