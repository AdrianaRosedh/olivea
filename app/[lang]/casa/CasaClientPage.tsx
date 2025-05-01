// app/[lang]/casa/CasaClientPage.tsx
"use client";

import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { useEffect, useRef, useState } from "react";
import MobileSectionTracker from "@/components/MobileSectionTracker";

export default function CasaClientPage({
  lang,
  dict,
}: {
  lang: string;
  dict: any;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionIds = ["rooms", "breakfast", "experiences", "location"];
  // … your two useEffects remain here …
  return (
    <>
      <div
        ref={containerRef}
        className={`h-screen overflow-y-auto scroll-smooth overscroll-none touch-pan-y snap-y snap-mandatory pb-[120px] md:pb-0`}
      >
        {sectionIds.map((id) => (
          <section
            key={id}
            id={id}
            className="min-h-screen w-full flex items-center justify-center px-6 snap-center"
            aria-labelledby={`${id}-heading`}
          >
            <div>
              <TypographyH2 id={`${id}-heading`}>
                {dict.casa.sections[id]?.title}
              </TypographyH2>
              <TypographyP className="mt-2">
                {dict.casa.sections[id]?.description}
              </TypographyP>
            </div>
          </section>
        ))}
      </div>
      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}