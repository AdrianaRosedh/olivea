"use client";

import Image from "next/image";
import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import { motion } from "framer-motion";
import ScrollDrift from "@/components/scroll/ScrollDrift";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function DesignSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "design";
  const heading = t(data.heading, lang);
  const attribution = t(data.attribution, lang);
  const imgSrc = data.image?.src ?? "/images/casa/InteriorRooms1.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Design textures";
  const paragraphs = (data.paragraphs ?? []) as Array<{ id?: string; en: string; es: string }>;

  const titleNode = (
    <Reveal preset="up">
      <div>
        <h2 className="text-2xl md:text-4xl font-semibold leading-tight md:hidden">{heading}</h2>
        {attribution && <p className="mt-2 text-sm italic opacity-60 md:hidden">{attribution}</p>}
      </div>
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
      <div className="mt-10 md:mt-14 flex flex-col md:flex-row gap-8 md:gap-10 items-start">
        {/* Image column */}
        <div className="w-full md:w-1/2">
          <ScrollDrift fromX={-48} toX={22} reveal align="left" className="w-full">
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
          </ScrollDrift>
        </div>

        {/* Text column */}
        <div className="w-full md:w-1/2 md:pt-2">
          <div className="hidden md:block">
            <Reveal preset="up">
              <h2 className="text-2xl md:text-4xl font-semibold leading-tight">{heading}</h2>
            </Reveal>
            {attribution && (
              <Reveal preset="fade" delay={0.08}>
                <p className="mt-2 text-sm italic opacity-60">{attribution}</p>
              </Reveal>
            )}
          </div>

          <Reveal preset="fade" delay={0.15}>
            <div className="mt-4 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
          </Reveal>

          {paragraphs.map((p, i) => (
            <motion.div
              key={p.id ?? i}
              id={p.id}
              className="mt-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }}
            >
              <p>{t(p, lang)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </StickyBlock>
  );
}
