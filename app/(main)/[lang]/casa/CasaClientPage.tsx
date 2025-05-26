"use client";

import { useEffect } from "react";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import Image from "next/image";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, Variants, useAnimation } from "framer-motion";

interface SectionData {
  title: string;
  description: string;
  images?: { src: string; alt?: string }[];
  subsections?: Record<string, { title: string; description: string }>;
}

interface CasaClientPageProps {
  dict: AppDictionary;
}

const SECTION_ORDER = [
  "rooms",
  "mornings",
  "experiences",
  "ambience",
] as const;

type SectionKey = typeof SECTION_ORDER[number];

const contentVariants: Variants = {
  hidden: { y: "100vh" },
  visible: {
    y: "0",
    transition: { duration: 1, ease: "easeInOut" },
  },
};

export default function CasaClientPage({ dict }: CasaClientPageProps) {
  const controlsContent = useAnimation();

  // Slide the content up after a tiny delay (give the overlay time to exit)
  useEffect(() => {
    const timer = setTimeout(() => controlsContent.start("visible"), 100);
    return () => clearTimeout(timer);
  }, [controlsContent]);

  // Build ordered section keys and flattened IDs
  const sectionKeys = SECTION_ORDER.filter(
    (key) => key in dict.casa.sections
  ) as SectionKey[];

  const sectionIds = sectionKeys.flatMap((key) => [
    key,
    ...(dict.casa.sections[key].subsections
      ? Object.keys(dict.casa.sections[key].subsections!)
      : []),
  ]);

  return (
    <>
      <motion.div
        initial="hidden"
        animate={controlsContent}
        variants={contentVariants}
        className="relative"
      >
        {sectionKeys.map((key) => {
          const sec = dict.casa.sections[key] as SectionData;
          const images = sec.images?.length
            ? sec.images
            : [{ src: "/images/hero.jpg", alt: sec.title }];

          return (
            <section
              key={key}
              id={key}
              className="main-section min-h-screen flex flex-col items-center justify-center px-6"
            >
              <div className="max-w-2xl text-center">
                <TypographyH2>{sec.title}</TypographyH2>
                <TypographyP className="mt-2">{sec.description}</TypographyP>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {images.map((img, idx) => (
                  <div key={idx} className="bg-white shadow rounded overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt ?? ""}
                      width={800}
                      height={480}
                      className="object-cover w-full h-48"
                    />
                  </div>
                ))}
              </div>

              {sec.subsections &&
                Object.entries(sec.subsections).map(([subId, sub]) => (
                  <section
                    key={subId}
                    id={subId}
                    className="subsection min-h-screen flex flex-col items-center justify-center px-6"
                  >
                    <div className="max-w-2xl text-center">
                      <TypographyH3>{sub.title}</TypographyH3>
                      <TypographyP className="mt-2">{sub.description}</TypographyP>
                    </div>
                  </section>
                ))}
            </section>
          );
        })}
      </motion.div>

      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  );
}