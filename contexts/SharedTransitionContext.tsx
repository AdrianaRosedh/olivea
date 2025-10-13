// contexts/SharedTransitionContext.tsx
"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type SectionKey = "casa" | "cafe" | "farmtotable";

type Ctx = {
  isActive: boolean;
  targetHref: string | null;
  sectionKey: SectionKey | null;
  startTransition: (sectionKey: SectionKey, href: string) => void;
  clearTransition: () => void;
};

const SharedTransitionContext = createContext<Ctx | null>(null);

export function SharedTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [targetHref, setTargetHref] = useState<string | null>(null);
  const [sectionKey, setSectionKey] = useState<SectionKey | null>(null);

  const startTransition = useCallback((key: SectionKey, href: string) => {
    setSectionKey(key);
    setTargetHref(href);
    setIsActive(true);
  }, []);

  const clearTransition = useCallback(() => {
    setIsActive(false);
    setTargetHref(null);
    setSectionKey(null);
  }, []);

  const value = useMemo(
    () => ({ isActive, targetHref, sectionKey, startTransition, clearTransition }),
    [isActive, targetHref, sectionKey, startTransition, clearTransition]
  );

  return (
    <SharedTransitionContext.Provider value={value}>
      {children}
    </SharedTransitionContext.Provider>
  );
}

export function useSharedTransition() {
  const ctx = useContext(SharedTransitionContext);
  if (!ctx) throw new Error("useSharedTransition must be used within SharedTransitionProvider");
  return ctx;
}
