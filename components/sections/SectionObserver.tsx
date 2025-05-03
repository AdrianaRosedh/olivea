// components/sections/SectionObserver.tsx
"use client";

import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { useEffect, useRef } from "react";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";

// Shape of a section's content
interface SectionContent {
  title:       string;
  description: string;
}

// Props for the section observer component
interface SectionObserverProps {
  sections: Record<string, SectionContent>;
}

export default function SectionObserver({ sections }: SectionObserverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Define the order of sections
  const sectionIds = ["story", "garden", "menu", "wines"];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      e.preventDefault();
      const sectionId = link.getAttribute("href")!.slice(1);
      const sectionEl = document.getElementById(sectionId);
      if (sectionEl && containerRef.current) {
        sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `#${sectionId}`);
        setTimeout(() => window.dispatchEvent(new Event("scroll")), 600);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="scroll-container min-h-screen overflow-y-auto pb-[120px] md:pb-0"
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          scrollSnapType: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            ? "y none"
            : "y proximity",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {sectionIds.map((id) => (
          <section
            key={id}
            id={id}
            data-section-id={id}
            className="min-h-screen w-full flex flex-col items-center justify-center px-6 snap-center scroll-mt-[120px]"
            aria-labelledby={`${id}-heading`}
          >
            <div id={`${id}-heading`} className="max-w-2xl text-center">
              <TypographyH2>{sections[id]?.title}</TypographyH2>
              <TypographyP>{sections[id]?.description}</TypographyP>
            </div>
          </section>
        ))}
      </div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}