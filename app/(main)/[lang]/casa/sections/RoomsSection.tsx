"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import { motion } from "framer-motion";
import ScrollGrowImageBand from "@/components/mdx/ScrollGrowImageBand";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function RoomsSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "rooms";
  const heading = t(data.heading, lang);
  const paragraphs = (data.paragraphs ?? []) as Array<{ en: string; es: string }>;
  const imgSrc = data.image?.src ?? "/images/casa/room.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Suite";
  const lightParagraph = t(data.lightParagraph, lang);

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      title={<Reveal preset="up"><h2 className="text-2xl md:text-4xl font-semibold leading-tight">{heading}</h2></Reveal>}
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
    >
      <div className="mt-10 md:mt-14 max-w-[720px]">
        {paragraphs.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.12 }}
          >
            <p className={i > 0 ? "mt-4" : undefined}>{t(p, lang)}</p>
          </motion.div>
        ))}
      </div>

      <ScrollGrowImageBand
        src={imgSrc}
        alt={imgAlt}
        startH="170px"
        endH="520px"
        objectPosition="50% 55%"
        priority
        scrollContainerSelector="main"
      />

      {lightParagraph && (
        <motion.div
          id="luz"
          className="mt-10 max-w-[700px]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p>{lightParagraph}</p>
        </motion.div>
      )}
    </StickyBlock>
  );
}
