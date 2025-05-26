"use client";

import { useEffect } from "react";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import { TypographyH2, TypographyH3, TypographyP } from "@/components/ui/Typography";
import MobileSectionTracker from "@/components/navigation/MobileSectionTracker";
import { motion, Variants, useAnimation } from "framer-motion";
import Image from "next/image";

interface SectionData {
  title: string;
  description: string;
  images?: { src: string; alt?: string }[];
  subsections?: Record<string, { title: string; description: string }>;
}

interface CafeClientPageProps {
  dict: AppDictionary;
}

const CAFÉ_SECTION_ORDER = [
  "all_day",
  "padel",
  "menu",
  "community",
  "ambience",
] as const;

const contentVariants: Variants = {
  hidden: { y: "100vh" },
  visible: {
    y: "0",
    transition: { duration: 1, ease: "easeInOut" },
  },
};

export default function CafeClientPage({ dict }: CafeClientPageProps) {
  const controlsContent = useAnimation();

  // Slide the content up after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => controlsContent.start("visible"), 100);
    return () => clearTimeout(timer);
  }, [controlsContent]);

  const sectionKeys = CAFÉ_SECTION_ORDER.filter((key) =>
    key in dict.cafe.sections
  ) as Array<keyof typeof dict.cafe.sections>;

  const sectionIds = sectionKeys.flatMap((key) => [
    key,
    ...(dict.cafe.sections[key].subsections
      ? Object.keys(dict.cafe.sections[key].subsections!)
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
          const sec = dict.cafe.sections[key] as SectionData;
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
                      alt={img.alt || ""}
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