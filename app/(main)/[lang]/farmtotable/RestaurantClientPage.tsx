"use client";

import { useEffect } from "react";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, Variants, useAnimation } from "framer-motion";

interface SectionData {
  title: string;
  description: string;
  subsections?: Record<string, { title: string; description: string }>;
}

interface RestaurantClientPageProps {
  dict: AppDictionary;
}

const RESTAURANT_SECTION_ORDER = [
  "culinary_philosophy",
  "garden",
  "dining_experiences",
  "atmosphere",
  "chef_team",
  "community",
  "sustainability_commitment",
  "chef_garden_table",
  "local_artisans",
  "colibri_service",
] as const;

type SectionKey = typeof RESTAURANT_SECTION_ORDER[number];

// Slide‐up content variants
const contentVariants: Variants = {
  hidden: { y: "100vh" },
  visible: {
    y: "0",
    transition: { duration: 1, ease: "easeInOut" },
  },
};

export default function RestaurantClientPage({ dict }: RestaurantClientPageProps) {
  const controlsContent = useAnimation();

  // 1) On mount, delay a bit so the shared‐video overlay can exit, then slide content up
  useEffect(() => {
    const timer = setTimeout(() => controlsContent.start("visible"), 100);
    return () => clearTimeout(timer);
  }, [controlsContent]);

  // 2) Build your section keys & flattened IDs for the tracker
  const sectionKeys = RESTAURANT_SECTION_ORDER.filter((key) =>
    key in dict.farmtotable.sections
  ) as SectionKey[];

  const sectionIds = sectionKeys.flatMap((key) => [
    key,
    ...(dict.farmtotable.sections[key].subsections
      ? Object.keys(dict.farmtotable.sections[key].subsections!)
      : []),
  ]);

  return (
    <>
      {/* Slide‐in wrapper for ALL your header + sections */}
      <motion.div
        initial="hidden"
        animate={controlsContent}
        variants={contentVariants}
        className="relative"
      >
        <header className="text-center py-12 px-6">
          <TypographyH1>{dict.farmtotable.title}</TypographyH1>
          <TypographyP className="mt-2">
            {dict.farmtotable.description}
          </TypographyP>
        </header>

        {sectionKeys.map((key) => {
          const sec = dict.farmtotable.sections[key] as SectionData;
          return (
            <section
              key={key}
              id={key}
              className="main-section min-h-screen snap-start flex flex-col items-center justify-center px-6"
            >
              <div className="max-w-2xl text-center">
                <TypographyH2>{sec.title}</TypographyH2>
                <TypographyP className="mt-2">{sec.description}</TypographyP>
              </div>

              {sec.subsections &&
                Object.entries(sec.subsections).map(([subId, sub]) => (
                  <section
                    key={subId}
                    id={subId}
                    className="subsection min-h-screen snap-start flex flex-col items-center justify-center px-6"
                  >
                    <div className="max-w-2xl text-center">
                      <TypographyH3>{sub.title}</TypographyH3>
                      <TypographyP className="mt-2">
                        {sub.description}
                      </TypographyP>
                    </div>
                  </section>
                ))}
            </section>
          );
        })}
      </motion.div>

      {/* Your mobile tracker stays the same */}
      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}