"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

interface ScrollHandler {
  raf: (time: number) => void;
  on: (event: "scroll", handler: ({ scroll }: { scroll: number }) => void) => void;
  off: (event: "scroll", handler: ({ scroll }: { scroll: number }) => void) => void;
  scrollTo: (target: number, options?: { duration?: number; easing?: (t: number) => number }) => void;
  destroy: () => void;
}

const dummyLenis: ScrollHandler = {
  raf: () => {},
  on: () => {},
  off: () => {},
  scrollTo: () => {},
  destroy: () => {},
};

const ScrollContext = createContext<ScrollHandler>(dummyLenis);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    lenisRef.current = new Lenis({
      lerp: 0.07,                         // smoother easing
      duration: 1.0,                      // responsive scrolling
      gestureOrientation: "vertical",     // touch scrolling vertical
      smoothWheel: true,                  // smooth mouse wheel
      touchMultiplier: 2.0,               // responsiveness for touch devices
      wheelMultiplier: 1.0,               // responsiveness for mouse wheel
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // custom gentle easing
    });

    const raf = (time: number) => {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => lenisRef.current?.destroy();
  }, []);

  return (
    <ScrollContext.Provider value={lenisRef.current ?? dummyLenis}>
      {children}
    </ScrollContext.Provider>
  );
}

export const useLenis = () => useContext(ScrollContext);