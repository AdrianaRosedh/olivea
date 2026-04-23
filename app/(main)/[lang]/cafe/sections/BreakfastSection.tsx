"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import Sub from "@/components/scroll/Sub";
import ParallaxImage from "@/components/scroll/ParallaxImage";
import ScrollDrift from "@/components/scroll/ScrollDrift";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function BreakfastSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "desayuno";
  const heading = t(data.heading, lang);
  const caption = t(data.caption, lang);
  const imgSrc = data.image?.src ?? "/images/cafe/breakfast6.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Breakfast at Olivea Cafe";
  const paragraphs = (data.paragraphs ?? []) as Array<{
    id: { en: string; es: string };
    en: string;
    es: string;
  }>;

  // First 3 paragraphs go in the right column, last one goes full-width
  const rightParagraphs = paragraphs.slice(0, 3);
  const bottomParagraph = paragraphs[3];

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      containerClassName="w-full md:max-w-[min(1220px,94vw)] md:mx-auto"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      title={null}
    >
      <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
        {/* Image LEFT */}
        <div className="md:col-span-6">
          <ScrollDrift fromX={-18} toX={26} reveal className="w-full">
            <div
              className="
                relative w-full
                overflow-hidden rounded-[34px]
                ring-1 ring-black/10
                shadow-[0_34px_90px_rgba(0,0,0,0.32)]
                bg-[var(--olivea-cream)]/95
              "
            >
              <ParallaxImage
                src={imgSrc}
                alt={imgAlt}
                heightVh={62}
                speed={0.14}
                fit="cover"
                objectPosition="50% 58%"
              />
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/26 via-black/10 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-white/10" />
              </div>
            </div>
          </ScrollDrift>

          {caption && (
            <Reveal preset="fade" delay={0.12}>
              <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--olivea-ink)]/55">
                <span className="h-[1px] w-10 bg-black/10" />
                <span>{caption}</span>
              </div>
            </Reveal>
          )}
        </div>

        {/* Right column */}
        <div className="md:col-span-6 md:pt-1">
          <Reveal preset="up" delay={0.10}>
            <h2 className="text-2xl md:text-4xl font-semibold leading-tight">
              {heading}
            </h2>
          </Reveal>

          <Reveal preset="fade" delay={0.20}>
            <div className="mt-6 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
          </Reveal>

          <div className="mt-7 max-w-[42ch] space-y-6">
            {rightParagraphs.map((p, i) => (
              <Sub
                key={i}
                id={t(p.id, lang)}
                preset={i === 0 ? "up" : "fade"}
                className="!min-h-0 !mb-0"
              >
                {lang === "es" ? p.es : p.en}
              </Sub>
            ))}
          </div>
        </div>

        {/* Full-width continuation */}
        {bottomParagraph && (
          <div className="md:col-span-12 -mt-2 md:-mt-4">
            <div className="max-w-[1120px] mx-auto">
              <Sub
                id={t(bottomParagraph.id, lang)}
                preset="left"
                className="mt-0 !min-h-0 !mb-0"
              >
                {lang === "es" ? bottomParagraph.es : bottomParagraph.en}
              </Sub>
            </div>
          </div>
        )}
      </div>
    </StickyBlock>
  );
}
