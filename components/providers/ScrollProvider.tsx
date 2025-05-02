/* ScrollProvider.tsx
   Provides a single, global Lenis instance for smooth scrolling
   and an easy `useLenis()` hook to subscribe to scroll events.
*/

"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

// Context to hold Lenis instance
const ScrollContext = createContext<Lenis | null>(null);

interface ScrollProviderProps {
  children: React.ReactNode;
}

export function ScrollProvider({ children }: ScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => t,
        smoothWheel: true,
        smoothTouch: true,
        orientation: "vertical",
    });

    // requestAnimationFrame loop
    function raf(time: number) {
      lenisRef.current!.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  return (
    <ScrollContext.Provider value={lenisRef.current}>
      {children}
    </ScrollContext.Provider>
  );
}

// Hook to access Lenis instance
export function useLenis() {
  const lenis = useContext(ScrollContext);
  if (!lenis) {
    throw new Error("useLenis must be used within <ScrollProvider>");
  }
  return lenis;
}
