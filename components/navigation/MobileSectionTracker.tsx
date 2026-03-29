"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/contexts/NavigationContext";

interface MobileSectionTrackerProps {
  sectionIds: readonly string[];
}

/**
 * Watches main sections and updates activeSection while NOT in manual navigation.
 * Uses a SINGLE IntersectionObserver for all targets (instead of N observers).
 */
export default function MobileSectionTracker({ sectionIds }: MobileSectionTrackerProps) {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { setActiveSection, isManualNavigation } = useNavigation();

  useEffect(() => {
    // cleanup previous
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (isManualNavigation) return;

    const headerV = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    const headerN = parseInt(headerV || "", 10);
    const top = Number.isFinite(headerN) && headerN > 0 ? headerN + 8 : 72;

    const elements: HTMLElement[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) elements.push(el);
    }

    if (!elements.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (isManualNavigation) return;

        let candidate: HTMLElement | null = null;
        let bestTop = Number.POSITIVE_INFINITY;

        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const t = e.boundingClientRect.top;
          if (t >= 0 && t < bestTop) {
            bestTop = t;
            candidate = e.target as HTMLElement;
          }
        }

        if (candidate?.id) setActiveSection(candidate.id);
      },
      {
        root: null,
        rootMargin: `-${top}px 0px -66% 0px`,
        threshold: [0.25],
      }
    );

    elements.forEach((el) => obs.observe(el));
    observerRef.current = obs;

    return () => obs.disconnect();
  }, [sectionIds, isManualNavigation, setActiveSection, pathname]);

  return null;
}
