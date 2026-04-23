"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import ServicesGrid from "@/components/mdx/ServicesGrid";
import CardParallax from "@/components/mdx/CardParallax";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function PadelSection({ data, lang }: SectionProps) {
  const heading = t(data.heading, lang);
  const imgSrc = data.image?.src ?? "/images/cafe/padel3.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Padel at Olivea";
  const body = (data.body ?? []) as Array<{ en: string; es: string }>;
  const cards = (data.cards ?? []) as Array<{
    id: { en: string; es: string };
    title: { en: string; es: string };
    text: { en: string; es: string };
  }>;

  return (
    <StickyBlock
      id="padel"
      variant="top"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start overflow-hidden"
      title={
        <Reveal preset="up">
          <h2 className="text-2xl md:text-4xl font-semibold">
            {heading}
          </h2>
        </Reveal>
      }
    >
      {/* Image band */}
      <div className="relative mt-6">
        <div className="relative overflow-hidden rounded-[22px] ring-1 ring-black/10 h-[190px] md:h-[300px]">
          <CardParallax
            src={imgSrc}
            alt={imgAlt}
            speed={0.14}
            fit="cover"
            objectPosition="50% 60%"
            sizes="(max-width: 768px) 100vw, 1080px"
            loading="lazy"
            placeholder="empty"
            className="-inset-[12px]"
            surfaceClassName="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/14 via-transparent to-transparent" />
        </div>
      </div>

      <Reveal preset="fade" delay={0.12}>
        <div className="mt-6 max-w-[78ch] text-[15.5px] md:text-[16.5px] leading-relaxed text-[var(--olivea-ink)]/85">
          {body.map((p, i) => (
            <p key={i} className={i > 0 ? "mt-3" : undefined}>
              {t(p, lang)}
            </p>
          ))}
        </div>
      </Reveal>

      <ServicesGrid
        items={cards.map((c) => ({
          id: t(c.id, lang),
          title: t(c.title, lang),
          text: t(c.text, lang),
        }))}
      />
    </StickyBlock>
  );
}
