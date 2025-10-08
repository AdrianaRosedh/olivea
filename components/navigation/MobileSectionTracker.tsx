"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/contexts/NavigationContext";

interface MobileSectionTrackerProps {
  sectionIds: readonly string[];
}

/**
 * Watches main sections and updates activeSection while NOT in manual navigation.
 */
export default function MobileSectionTracker({ sectionIds }: MobileSectionTrackerProps) {
  const pathname = usePathname();
  const observersRef = useRef<IntersectionObserver[]>([]);
  const { setActiveSection, isManualNavigation } = useNavigation();

  const headerPx = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    const n = parseInt(v || "", 10);
    return Number.isFinite(n) && n > 0 ? n + 8 : 72; // header + a little breathing room
  };

  const initializeObservers = useCallback(() => {
    // cleanup any previous
    observersRef.current.forEach((obs) => obs.disconnect());
    observersRef.current = [];

    if (isManualNavigation) return;

    const top = headerPx();

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`MobileSectionTracker: section "${id}" not found`);
        return;
      }

      const obs = new IntersectionObserver(
        (entries) => {
          if (isManualNavigation) return;
          // choose the top-most visible section deterministically
          let candidate: HTMLElement | null = null;
          let bestTop = Number.POSITIVE_INFINITY;

          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const t = (e.target as HTMLElement).getBoundingClientRect().top;
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
          threshold: [0.25], // calmer, fewer flips
        }
      );

      obs.observe(el);
      observersRef.current.push(obs);
    });
  }, [sectionIds, isManualNavigation, setActiveSection]);

  useEffect(() => {
    const timer = window.setTimeout(initializeObservers, 200);
    return () => {
      observersRef.current.forEach((obs) => obs.disconnect());
      window.clearTimeout(timer);
    };
  }, [initializeObservers, pathname]);

  return null;
}