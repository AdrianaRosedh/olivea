// contexts/NavigationContext.tsx
"use client";

import type React from "react";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

type NavigationContextType = {
  activeSection: string | null;
  setActiveSection: (id: string) => void;
  isManualNavigation: boolean;
  setIsManualNavigation: (isManual: boolean) => void;
  navigateToSection: (sectionId: string) => void;
};

const NavigationContext = createContext<NavigationContextType>({
  activeSection: null,
  setActiveSection: () => {},
  isManualNavigation: false,
  setIsManualNavigation: () => {},
  navigateToSection: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

/* ── helpers ──────────────────────────────────────────────────────────────── */
function headerPx(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  const n = parseInt(v || "", 10);
  return Number.isFinite(n) && n > 0 ? n : 64; // sensible fallback
}
function clampToMaxScroll(y: number): number {
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(0, y), maxY);
}
function setSnapDisabled(disabled: boolean) {
  // .snap-container will have its snap disabled while this class is on <html>
  document.documentElement.classList.toggle("snap-disable", disabled);
}

/* ── provider ─────────────────────────────────────────────────────────────── */
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeSection, _setActiveSection] = useState<string | null>(null);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const unlockTO = useRef<number | null>(null);

  // Observers (IO / rAF) can still set active section, but should guard with isManualNavigation.
  const setActiveSection = useCallback((id: string) => {
    _setActiveSection(id);
  }, []);

  const navigateToSection = useCallback((sectionId: string) => {
    // find target (supports main/sub anchors)
    const el =
      document.getElementById(sectionId) ||
      document.querySelector<HTMLElement>(`.main-section#${sectionId}`) ||
      document.querySelector<HTMLElement>(`.subsection#${sectionId}`);

    if (!el) return;

    // compute Y so the section lands just under the header
    const topOffset = headerPx() + 8;
    const rect = el.getBoundingClientRect();
    const targetY = clampToMaxScroll(window.scrollY + rect.top - topOffset);

    // lock observers + relax snapping while we animate
    setIsManualNavigation(true);
    setSnapDisabled(true);
    if (unlockTO.current) window.clearTimeout(unlockTO.current);

    // smooth scroll (swap with Lenis if you prefer; keep same offset logic)
    window.scrollTo({ top: targetY, behavior: "smooth" });

    // reflect selection & URL without polluting history
    _setActiveSection(sectionId);
    if (window.location.hash.slice(1) !== sectionId) {
      history.replaceState(null, "", `#${sectionId}`);
    }

    // unlock after easing + tiny settle window (match your easing ~600–900ms)
    unlockTO.current = window.setTimeout(() => {
      setIsManualNavigation(false);
      setSnapDisabled(false);
    }, 750);
  }, []);

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (unlockTO.current) window.clearTimeout(unlockTO.current);
      setSnapDisabled(false); // safety: re-enable snap if we unmount mid-scroll
    };
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isManualNavigation,
        setIsManualNavigation,
        navigateToSection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}