// app/[lang]/restaurant/RestaurantClientPage.tsx
"use client";

import { useEffect, useRef } from "react";
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";

const ALL_SECTIONS = ["story", "garden", "menu", "wines"] as const;
type SectionKey = (typeof ALL_SECTIONS)[number];

export interface SectionDict {
  title: string;
  description: string;
}

export interface RestaurantClientPageProps {
  lang: "en" | "es";
  dict: {
    title: string;
    description: string;
    sections: Record<SectionKey, SectionDict>;
  };
}

export default function RestaurantClientPage({
  lang,
  dict,
}: RestaurantClientPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth-scroll anchor links
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      e.preventDefault();
      const id = link.getAttribute("href")!.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${id}`);
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Initial "bump" scroll to trigger observers
  useEffect(() => {
    const bump = () => {
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
      document.dispatchEvent(new Event("scroll"));
    };
    [100, 300, 600].forEach((ms) => setTimeout(bump, ms));
  }, []);

  return (
    <>
      {/* PAGE HEADER */}
      <header className="text-center py-12 px-6">
        <TypographyH1>{dict.title}</TypographyH1>
        <TypographyP className="mt-2">{dict.description}</TypographyP>
      </header>

      {/* SECTIONS CONTAINER */}
      <div lang={lang} ref={containerRef}>
        {ALL_SECTIONS.map((id) => {
          const info = dict.sections[id];
          return (
            <section
              key={id}
              id={id}
              data-section-id={id}
              className="min-h-screen snap-start flex flex-col items-center justify-center px-6"
              aria-labelledby={`${id}-heading`}
            >
              <div className="max-w-2xl text-center">
                <TypographyH2 id={`${id}-heading`}>
                  {info.title}
                </TypographyH2>
                <TypographyP className="mt-2">
                  {info.description}
                </TypographyP>
              </div>
            </section>
          );
        })}
      </div>

      {/* MOBILE SECTION NAV */}
      <MobileSectionTracker sectionIds={ALL_SECTIONS as readonly string[]} />
    </>
  );
}