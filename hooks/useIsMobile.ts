"use client";
import { useState, useEffect } from "react";

export function useIsMobile(maxWidth: number = 767): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    let rafId = 0;
    const update = () => {
      // Throttle rapid changes with requestAnimationFrame
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsMobile(mq.matches);
      });
    };
    update(); // set initial value
    mq.addEventListener?.("change", update);
    mq.addListener?.(update); // for browsers that use addListener
    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener?.("change", update);
      mq.removeListener?.(update);
    };
  }, [maxWidth]);

  return isMobile;
}
