"use client";

import Image from "next/image";
import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import { motion } from "framer-motion";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function CourtyardSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "courtyard";
  const heading = t(data.heading, lang);
  const imgSrc = data.image?.src ?? "/images/casa/patio.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Courtyard";
  const paragraphs = (data.paragraphs ?? []) as Array<{ id?: string; en: string; es: string }>;

  const titleNode = (
    <Reveal preset="up">
      <h2 className="text-2xl md:text-4xl font-semibold leading-tight md:hidden">{heading}</h2>
    </Reveal>
  );

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      title={titleNode}
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
    >
      <div className="mt-10 md:mt-14 flex flex-col md:flex-row gap-8 md:gap-10 md:items-center">
        {/* Text column */}
        <div className="w-full md:w-1/2">
          <div className="hidden md:block">
            <Reveal preset="up">
              <h2 className="text-2xl md:text-4xl font-semibold leading-tight">{heading}</h2>
            </Reveal>
          </div>

          <Reveal preset="fade" delay={0.1}>
            <div className="mt-4 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
          </Reveal>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {paragraphs.map((p, i) => (
              <p key={p.id ?? i} id={p.id} className={i > 0 ? "mt-4" : undefined}>
                {t(p, lang)}
              </p>
            ))}
          </motion.div>
        </div>

        {/* Image column */}
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="relative w-full h-[50vh] overflow-hidden rounded-[28px] ring-1 ring-black/10 shadow-[0_34px_90px_rgba(0,0,0,0.32)]">
            <Image
              src={imgSrc}
              alt={imgAlt}
              fill
              className="object-cover"
              quality={80}
              priority
            />
          </div>
        </motion.div>
      </div>
    </StickyBlock>
  );
}
