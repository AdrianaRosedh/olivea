// app/[lang]/casa/CasaClientPage.tsx
"use client";

import { useEffect, useRef } from "react";
import type { AppDictionary } from "../dictionaries";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";

// 1) Define your known section IDs as a literal tuple
const SECTION_IDS = ["rooms", "breakfast", "experiences", "location"] as const;
type SectionId = typeof SECTION_IDS[number];

interface CasaClientPageProps {
  dict: AppDictionary;
}

export default function CasaClientPage({ dict }: CasaClientPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 2) Smooth‐scroll in‐page hash‐links
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="#"]') as
        | HTMLAnchorElement
        | null;
      if (!link) return;
      e.preventDefault();
      const id = link.getAttribute("href")!.slice(1) as SectionId;
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

  // 3) “Bump” the scroll so your observers fire immediately
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
      <div
        ref={containerRef}
        className="scroll-container h-screen overflow-y-auto scroll-smooth overscroll-none touch-pan-y snap-y snap-mandatory pb-[120px] md:pb-0"
      >
        {SECTION_IDS.map((id) => (
          <section
            key={id}
            id={id}
            data-section-id={id}
            className="min-h-screen w-full flex items-center justify-center px-6 snap-center"
            aria-labelledby={`${id}-heading`}
          >
            <div id={`${id}-heading`} className="max-w-2xl text-center">
              <TypographyH2>
                {dict.casa.sections[id].title}
              </TypographyH2>
              <TypographyP className="mt-2">
                {dict.casa.sections[id].description}
              </TypographyP>
            </div>
          </section>
        ))}
      </div>

      <MobileSectionTracker
        sectionIds={SECTION_IDS as readonly string[]}
      />
    </>
  );
}