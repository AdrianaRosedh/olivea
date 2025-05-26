// components/contexts/SharedTransitionContext.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type VideoKey = "casa" | "cafe" | "farmtotable";

interface TransitionState {
  isActive: boolean;
  videoKey: VideoKey | null;
  targetHref: string | null;
  startTransition: (videoKey: VideoKey, href: string) => void;
  clearTransition: () => void;
}

const SharedTransitionContext = createContext<TransitionState | undefined>(undefined);

export function SharedTransitionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [videoKey, setVideoKey] = useState<VideoKey | null>(null);
  const [targetHref, setTargetHref] = useState<string | null>(null);

  const startTransition = useCallback((key: VideoKey, href: string) => {
    setIsActive(active => {
      if (active) return active;    // already in flight—ignore double clicks
      setVideoKey(key);
      setTargetHref(href);
      return true;
    });
  }, []);

  const clearTransition = useCallback(() => {
    // you could add a small timeout here if you need a
    // fade‐out delay before resetting to inactive
    setIsActive(false);
    setVideoKey(null);
    setTargetHref(null);
  }, []);

  return (
    <SharedTransitionContext.Provider
      value={{
        isActive,
        videoKey,
        targetHref,
        startTransition,
        clearTransition,
      }}
    >
      {children}
    </SharedTransitionContext.Provider>
  );
}

export function useSharedTransition() {
  const ctx = useContext(SharedTransitionContext);
  if (!ctx) {
    throw new Error("useSharedTransition must be used within SharedTransitionProvider");
  }
  return ctx;
}
