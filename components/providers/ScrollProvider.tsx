"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

// A minimal interface covering the methods we use
interface ScrollHandler {
  raf: (time: number) => void;
  on: (event: "scroll", handler: ({ scroll }: { scroll: number }) => void) => void;
  off: (event: "scroll", handler: ({ scroll }: { scroll: number }) => void) => void;
  destroy: () => void;
}

// Dummy no-op implementation for SSR / hydration
const dummyLenis: ScrollHandler = {
  raf: () => {},
  on: () => {},
  off: () => {},
  destroy: () => {},
};

// Provide a ScrollHandler (real Lenis on client, dummy on server)
const ScrollContext = createContext<ScrollHandler>(dummyLenis);

interface ScrollProviderProps {
  children: React.ReactNode;
}

export function ScrollProvider({ children }: ScrollProviderProps) {
  const lenisRef = useRef<ScrollHandler>(
    typeof window !== "undefined"
      ? new Lenis({ orientation: "vertical", lerp: 0.1 })
      : dummyLenis
  );

  useEffect(() => {
    // Only start RAF loop if we have a real Lenis instance
    if (lenisRef.current !== dummyLenis) {
      const lenis = lenisRef.current as Lenis;
      const run = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
      return () => lenis.destroy();
    }
  }, []);

  return (
    <ScrollContext.Provider value={lenisRef.current}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useLenis(): ScrollHandler {
  return useContext(ScrollContext);
}
