// app/[lang]/restaurant/RestaurantClientPage.tsx
"use client";

import { useEffect, useRef } from "react";
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";

const ALL_SECTIONS = ["story", "garden", "menu", "wines"] as const;
type SectionKey = typeof ALL_SECTIONS[number];

export interface SectionDict {
  title:       string;
  description: string;
}

export interface RestaurantClientPageProps {
  /** the 2-letter locale code, "en" or "es" */
  lang:     "en" | "es";
  /** dictionary for the whole “restaurant” page */
  dict: {
    title:       string;
    description: string;
    sections:    Record<SectionKey, SectionDict>;
  };
}

export default function RestaurantClientPage({
  lang,
  dict,
}: RestaurantClientPageProps) {
  const containerRef     = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Smooth‐scroll any in‐page hash links
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("href")!.slice(1) as SectionKey;
      const el = document.getElementById(id);
      if (el && containerRef.current) {
        containerRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" });
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = window.setTimeout(() => {
          document.dispatchEvent(
            new CustomEvent("sectionInView", { detail: { id, intersectionRatio: 1 } })
          );
        }, 800);
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (scrollTimeoutRef.current !== null) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // “Bump” scroll so IntersectionObservers fire right away
  useEffect(() => {
    const bump = () => {
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
      document.dispatchEvent(new Event("scroll"));
    };
    [100, 300, 600].forEach((t) => window.setTimeout(bump, t));
  }, []);

  return (
    <>
      {/* PAGE HEADER */}
      <header className="text-center py-12 px-6">
        <TypographyH1>{dict.title}</TypographyH1>
        <TypographyP className="mt-2">{dict.description}</TypographyP>
      </header>

      {/* SECTIONS */}
      <div
        ref={containerRef}
        className="scroll-container min-h-screen overflow-y-auto snap-y snap-mandatory"
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {ALL_SECTIONS.map((id) => {
          const info = dict.sections[id];
          return (
            <section
              key={id}
              id={id}
              data-section-id={id}
              className="min-h-screen snap-center flex flex-col items-center justify-center px-6"
              aria-labelledby={`${id}-heading`}
            >
              <div className="max-w-2xl text-center">
                <TypographyH2 id={`${id}-heading`}>{info.title}</TypographyH2>
                <TypographyP className="mt-2">{info.description}</TypographyP>
              </div>
            </section>
          );
        })}
      </div>

      {/* BACK-TO-TOP BUTTON */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="px-4 py-2 bg-[var(--olivea-olive)] text-white rounded-md shadow"
        >
          {lang === "es" ? "Volver arriba" : "Back to top"}
        </button>
      </div>

      {/* MOBILE NAV */}
      <MobileSectionTracker sectionIds={ALL_SECTIONS as readonly string[]} />
    </>
  );
}