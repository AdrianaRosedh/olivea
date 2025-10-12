// components/providers/ScrollProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Lenis from "lenis";

/** Matches Lenis' emitted "scroll" event payload */
export type LenisScrollEvent = {
  scroll: number;              // current scroll position (px)
  limit: number;               // max scroll (px)
  velocity: number;            // px per frame
  direction: -1 | 0 | 1;       // -1 up, 0 idle, 1 down
  progress: number;            // 0..1
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

const noop: ScrollHandler = {
  raf: () => {},
  on: () => {},
  off: () => {},
  scrollTo: () => {},
  destroy: () => {},
};

const ScrollContext = createContext<ScrollHandler>(noop);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [api, setApi] = useState<ScrollHandler>(noop);

  useEffect(() => {
    if (typeof window === "undefined") return;

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

    // Keep CSS var in sync for gradient hue shift
    const setScrollPer = (value: number) => {
      const clamped = Math.max(0, Math.min(1, value));
      document.documentElement.style.setProperty("--scroll-per", String(clamped));
    };

    const onScroll = ({ scroll, limit }: LenisScrollEvent) => {
      setScrollPer(limit ? scroll / limit : 0);
    };

    lenis.on("scroll", onScroll);

    const loop = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);

    // Expose a typed, stable API (no `any`)
    const exposed: ScrollHandler = {
      raf: (t) => lenis.raf(t),
      on: (event, handler) => lenis.on(event, handler),
      off: (event, handler) => lenis.off(event, handler),
      scrollTo: (target, options) => lenis.scrollTo(target, options),
      destroy: () => {
        if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
        lenis.off("scroll", onScroll);
        lenis.destroy();
      },
    };
    
    // after starting the RAF
    const onVisibility = () => {
      const id = rafIdRef.current;
      if (document.visibilityState === "hidden" && id !== null) {
        cancelAnimationFrame(id);
        rafIdRef.current = null;
      } else if (document.visibilityState === "visible" && rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);     

    // in cleanup:
    document.removeEventListener("visibilitychange", onVisibility);

    // Make the real API available to consumers
    setApi(exposed);

    // Seed initial value (in case page loads scrolled)
    requestAnimationFrame(() => {
      const el = document.documentElement;
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      setScrollPer(max ? (window.scrollY || 0) / max : 0);
    });

    return () => {
      exposed.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}

export const useLenis = () => useContext(ScrollContext);
