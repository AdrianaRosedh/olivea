"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import { motion } from "framer-motion";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function PracticalSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "practical";
  const heading = t(data.heading, lang);
  const cards = (data.cards ?? []) as Array<{
    id: string;
    title: { en: string; es: string };
    body: { en: string; es: string };
  }>;

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      title={<Reveal preset="up"><h2 className="text-2xl md:text-4xl font-semibold leading-tight">{heading}</h2></Reveal>}
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
    >
      <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            id={card.id}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 p-6 shadow"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <p className="text-sm font-semibold tracking-wide uppercase">
              {t(card.title, lang)}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed opacity-80">
              {t(card.body, lang)}
            </p>
          </motion.div>
        ))}
      </div>
    </StickyBlock>
  );
}
