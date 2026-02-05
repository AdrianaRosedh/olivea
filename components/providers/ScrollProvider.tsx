// components/providers/ScrollProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* ── Types ───────────────────────────────────────────────────────── */
export type LenisScrollEvent = {
  scroll: number;
  limit: number;
  velocity: number;
  direction: -1 | 0 | 1;
  progress: number;
};

export interface ScrollHandler {
  raf: (time: number) => void;
  on: (event: "scroll", handler: (e: LenisScrollEvent) => void) => void;
  off: (event: "scroll", handler: (e: LenisScrollEvent) => void) => void;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { duration?: number; easing?: (t: number) => number }
  ) => void;
  destroy: () => void;
}

/* Lenis instance shape we actually use (keeps types light & no `any`) */
type LenisInstance = {
  raf: (time: number) => void;
  on: (event: "scroll", handler: (e: LenisScrollEvent) => void) => void;
  off: (event: "scroll", handler: (e: LenisScrollEvent) => void) => void;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { duration?: number; easing?: (t: number) => number }
  ) => void;
  destroy: () => void;
};

type LenisCtor = new (opts: {
  lerp?: number;
  duration?: number;
  gestureOrientation?: "vertical" | "horizontal" | "both";
  smoothWheel?: boolean;
  touchMultiplier?: number;
  wheelMultiplier?: number;
  easing?: (t: number) => number;
}) => LenisInstance;

type LenisModule = { default: LenisCtor };

const noop: ScrollHandler = {
  raf: () => {},
  on: () => {},
  off: () => {},
  scrollTo: () => {},
  destroy: () => {},
};

const ScrollContext = createContext<ScrollHandler>(noop);

/* ── Helpers ─────────────────────────────────────────────────────── */
function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  // Tailwind md
  return window.matchMedia("(min-width: 768px)").matches;
}

function motionOK(): boolean {
  if (typeof window === "undefined") return true;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setScrollPerFromWindowScroll() {
  const el = document.documentElement;
  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  const per = max ? (window.scrollY || 0) / max : 0;
  const clamped = Math.max(0, Math.min(1, per));
  el.style.setProperty("--scroll-per", String(clamped));
}

/* Cached dynamic import so we only download once */
let _lenisModulePromise: Promise<LenisModule> | null = null;
async function loadLenisModule(): Promise<LenisModule> {
  if (_lenisModulePromise) return _lenisModulePromise;
  _lenisModulePromise = import("lenis");
  return _lenisModulePromise;
}

/* ── Provider ────────────────────────────────────────────────────── */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisInstance | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [api, setApi] = useState<ScrollHandler>(noop);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Always keep --scroll-per working (even without Lenis)
    setScrollPerFromWindowScroll();

    // MOBILE / reduced-motion path: no Lenis, no RAF loop
    if (!isDesktop() || !motionOK()) {
      const onScroll = () => setScrollPerFromWindowScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      // Keep API as noop (safe for callers)
      setApi(noop);

      return () => {
        window.removeEventListener("scroll", onScroll);
      };
    }

    let disposed = false;

    const setup = async () => {
      const mod = await loadLenisModule();
      if (disposed) return;

      const Lenis = mod.default;

      const lenis = new Lenis({
        lerp: 0.07,
        duration: 1.0,
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 2.0,
        wheelMultiplier: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      lenisRef.current = lenis;

      const onLenisScroll = ({ scroll, limit }: LenisScrollEvent) => {
        const per = limit ? scroll / limit : 0;
        const clamped = Math.max(0, Math.min(1, per));
        document.documentElement.style.setProperty("--scroll-per", String(clamped));
      };

      lenis.on("scroll", onLenisScroll);

      const loop = (time: number) => {
        // guard if stopped/disposed
        if (!lenisRef.current) return;
        lenisRef.current.raf(time);
        rafIdRef.current = requestAnimationFrame(loop);
      };

      rafIdRef.current = requestAnimationFrame(loop);

      const exposed: ScrollHandler = {
        raf: (t) => lenis.raf(t),
        on: (event, handler) => lenis.on(event, handler),
        off: (event, handler) => lenis.off(event, handler),
        scrollTo: (target, options) => lenis.scrollTo(target, options),
        destroy: () => {
          if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
          lenis.off("scroll", onLenisScroll);
          lenis.destroy();
        },
      };

      const onVisibilityChange = () => {
        if (!lenisRef.current) return;

        if (document.visibilityState === "hidden") {
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
        } else {
          if (rafIdRef.current === null) {
            rafIdRef.current = requestAnimationFrame(loop);
          }
        }
      };

      document.addEventListener("visibilitychange", onVisibilityChange);
      setApi(exposed);

      // Initial value
      requestAnimationFrame(() => setScrollPerFromWindowScroll());

      // Cleanup
      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        exposed.destroy();
        lenisRef.current = null;
      };
    };

    let cleanup: (() => void) | undefined;

    setup().then((c) => {
      cleanup = c;
    });

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, []);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}

export const useLenis = () => useContext(ScrollContext);
