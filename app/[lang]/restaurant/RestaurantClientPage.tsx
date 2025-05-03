"use client";

import { useEffect, useRef } from "react";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";

// 1️⃣ Define your sections as a literal tuple and derive the union
const ALL_SECTIONS = ["story", "garden", "menu", "wines"] as const;
type SectionKey = (typeof ALL_SECTIONS)[number];

export interface SectionDict {
  title:       string;
  description: string;
}

export interface RestaurantClientPageProps {
  lang:     string;
  sections: Partial<Record<SectionKey, SectionDict>>;
}

export default function RestaurantClientPage({
  lang,
  sections,
}: RestaurantClientPageProps) {
  const containerRef     = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Copy your readonly tuple into a mutable array
  const sectionIds: SectionKey[] = [...ALL_SECTIONS];

  // Smooth‐scroll anchor links inside this scroll‐container
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = (a as HTMLAnchorElement)
        .getAttribute("href")!
        .slice(1) as SectionKey;
      const el = document.getElementById(id);
      if (el && containerRef.current) {
        containerRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" });
        if (scrollTimeoutRef.current !== null) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(
          () => {
            document.dispatchEvent(
              new CustomEvent("sectionInView", {
                detail: { id, intersectionRatio: 1 },
              })
            );
          },
          800
        );
      }
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // “Bump” the scroll so your IntersectionObservers fire immediately
  useEffect(() => {
    const bump = () => {
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
      document.dispatchEvent(new Event("scroll"));
    };
    const timers = [100, 300, 600].map((ms) => window.setTimeout(bump, ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <div
        lang={lang} 
        ref={containerRef}
        className="scroll-container min-h-screen overflow-y-auto snap-y snap-mandatory"
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {sectionIds.map((id) => {
          const info = sections[id];
          return (
            <section
              key={id}
              id={id}
              data-section-id={id}
              className="min-h-screen snap-center flex flex-col items-center justify-center px-6"
              aria-labelledby={`${id}-heading`}
            >
              <div className="max-w-2xl text-center">
                <TypographyH2 id={`${id}-heading`}>
                  {info?.title}
                </TypographyH2>
                <TypographyP className="mt-2">
                  {info?.description}
                </TypographyP>
              </div>
            </section>
          );
        })}
      </div>

      <MobileSectionTracker sectionIds={sectionIds as string[]} />
    </>
  );
}