"use client";

import Image from "next/image";
import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import { motion } from "framer-motion";
import type { SectionProps } from "./types";
import { t } from "./md";

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
      {/* Full-width hero image */}
      <div className="mt-6 relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-[28px] ring-1 ring-black/10 shadow-[0_34px_90px_rgba(0,0,0,0.32)]">
        <Image
          src={imgSrc}
          alt={imgAlt}
          fill
          className="object-cover"
          quality={80}
          priority
        />
      </div>

      <Reveal preset="up" delay={0.1}>
        <h2 className="mt-10 text-2xl md:text-4xl font-semibold leading-tight">{heading}</h2>
      </Reveal>

      <Reveal preset="fade" delay={0.15}>
        <div className="mt-4 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {columns.map((col, i) => (
          <motion.div
            key={col.id}
            id={col.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.12 }}
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
