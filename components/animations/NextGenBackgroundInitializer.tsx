// components/animations/NextGenBackgroundInitializer.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NextGenBackgroundInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeBackground = () => {
      console.log("[NextGenBackgroundInitializer] Reinitializing background");

      // 1) mask the loader, etc.
      const bg = document.querySelector<HTMLElement>(".next-gen-background");
      if (!bg) return;
      bg.getBoundingClientRect();
      document.dispatchEvent(new CustomEvent("background:reinitialize"));

      // 2) grab *all* sections, telling TS they are HTMLElements
      const raw = document.querySelectorAll("section[id]");
      // force it into the right shape
      const sections = Array.from(raw) as HTMLElement[];

      if (sections.length === 0) return;

      // 3) pick the most‐visible section
      let best: HTMLElement | null = null;
      let bestRatio = 0;
      const vh = window.innerHeight;

      for (const section of sections) {
        const r = section.getBoundingClientRect();
        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        const ratio = visible / r.height;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = section;
        }
      }

      // 4) fire the event with a real `.id`
      if (best) {
        document.dispatchEvent(
          new CustomEvent("sectionInView", {
            detail: {
              id: best.id,
              intersectionRatio: bestRatio,
              fromInitializer: true,
            },
          })
        );
      }
    };

    // run a few times in case things load late
    const delays = [100, 300, 600, 1000];
    const timers = delays.map((d) =>
      window.setTimeout(initializeBackground, d)
    );

    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return null;
}