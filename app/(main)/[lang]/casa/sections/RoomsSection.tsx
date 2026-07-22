"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import StatChips from "@/components/mdx/StatChips";
import { motion } from "framer-motion";
import ScrollGrowImageBand from "@/components/mdx/ScrollGrowImageBand";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function RoomsSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "rooms";
  const heading = t(data.heading, lang);
  const subtitle = t(data.subtitle, lang);
  const paragraphs = (data.paragraphs ?? []) as Array<{ en: string; es: string }>;
  const imgSrc = data.image?.src ?? "/images/casa/room.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Suite";
  const lightParagraph = t(data.lightParagraph, lang);
  const stats = (data.stats ?? []).map(
    (s: { label: { en: string; es: string }; value: { en: string; es: string } }) => ({
      label: t(s.label, lang),
      value: t(s.value, lang),
    })
  );

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      containerClassName="w-full md:max-w-[min(1120px,94vw)] md:mx-auto"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      title={null}
    >
      {/* Title block — matches ExperienceSection: heading, subtitle, divider */}
      <div className="max-w-[860px]">
        <Reveal preset="up" delay={0.08}>
          <h2 className="text-2xl md:text-4xl font-semibold leading-tight">
            {heading}
          </h2>
        </Reveal>

        {subtitle && (
          <Reveal preset="fade" delay={0.18}>
            <p className="mt-3 text-[13px] md:text-[14px] text-[var(--olivea-ink)]/60 leading-relaxed">
              {subtitle}
            </p>
          </Reveal>
        )}

        <Reveal preset="fade" delay={0.26}>
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
        </Reveal>
      </div>

      {/* Prose */}
      <div className="mt-10 max-w-[720px]">
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

      {/* Info chips — matches ExperienceSection */}
      {stats.length > 0 && (
        <Reveal preset="fade" delay={0.18}>
          <div className="mt-8">
            <StatChips items={stats} />
          </div>
        </Reveal>
      )}

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
