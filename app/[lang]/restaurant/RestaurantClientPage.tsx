// app/[lang]/restaurant/RestaurantClientPage.tsx
"use client";

import { useRef } from "react";
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";

const ALL_SECTIONS = ["story", "garden", "menu", "wines"] as const;
type SectionKey = (typeof ALL_SECTIONS)[number];

export interface SectionDict {
  title:       string;
  description: string;
}

export interface RestaurantClientPageProps {
  /** the 2-letter locale code, "en" or "es" */
  lang: "en" | "es";
  /** your pre‐loaded dictionary for this page */
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
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* PAGE HEADER */}
      <header className="text-center py-12 px-6">
        <TypographyH1>{dict.title}</TypographyH1>
        <TypographyP className="mt-2">{dict.description}</TypographyP>
      </header>

      {/* SECTIONS CONTAINER */}
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
                <TypographyH2 id={`${id}-heading`}>
                  {info.title}
                </TypographyH2>
                <TypographyP className="mt-2">{info.description}</TypographyP>
              </div>
            </section>
          );
        })}
      </div>

      {/* BACK-TO-TOP BUTTON */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() =>
            containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          aria-label={lang === "es" ? "Volver arriba" : "Back to top"}
          className="px-4 py-2 bg-[var(--olivea-olive)] text-white rounded-md shadow"
        >
          {lang === "es" ? "Volver arriba" : "Back to top"}
        </button>
      </div>

      {/* MOBILE SECTION NAV */}
      <MobileSectionTracker sectionIds={ALL_SECTIONS as readonly string[]} />
    </>
  );
}