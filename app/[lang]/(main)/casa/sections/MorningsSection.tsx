"use client";

import ScrollGrowImageBand from "@/components/mdx/ScrollGrowImageBand";
import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal, { entrance } from "@/components/scroll/Reveal";
import { motion } from "framer-motion";
import type { SectionProps } from "./types";
import { t } from "./md";
import SectionHeading from "@/components/scroll/SectionHeading";

export default function MorningsSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "mornings";
  const heading = t(data.heading, lang);
  const imgSrc = data.image?.src ?? "/images/casa/morning.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Mornings at Olivea";
  const columns = (data.columns ?? []) as Array<{
    id: string;
    subHeading: { en: string; es: string };
    body: { en: string; es: string };
    note?: { en: string; es: string };
  }>;

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      title={null}
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
    >
      {/* Full-width image — opens from a strip to full height as it scrolls
          in, like the Rooms chapter's banner. */}
      <ScrollGrowImageBand
        src={imgSrc}
        alt={imgAlt}
        startH="220px"
        endH="640px"
        objectPosition="50% 50%"
        mobileH="60vh"
      />

      <Reveal preset="up" delay={0.1}>
        <SectionHeading className="mt-10 text-2xl md:text-4xl font-semibold leading-tight">{heading}</SectionHeading>
      </Reveal>

      <Reveal preset="fade" delay={0.15}>
        <div className="mt-4 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {columns.map((col, i) => (
          <motion.div
            key={col.id}
            id={col.id}
            {...entrance(i * 0.12)}
          >
            <p className="font-medium">{t(col.subHeading, lang)}</p>
            <p className="mt-3">{t(col.body, lang)}</p>
            {col.note && (
              <p className="mt-2 text-sm opacity-60">{t(col.note, lang)}</p>
            )}
          </motion.div>
        ))}
      </div>
    </StickyBlock>
  );
}
