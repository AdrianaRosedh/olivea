"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import Sub from "@/components/scroll/Sub";
import ParallaxImage from "@/components/scroll/ParallaxImage";
import ScrollDrift from "@/components/scroll/ScrollDrift";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function BreadSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "pan";
  const heading = t(data.heading, lang);
  const caption = t(data.caption, lang);
  const imgSrc = data.image?.src ?? "/images/cafe/pan.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Bread and pastry at Olivea Cafe";
  const paragraphs = (data.paragraphs ?? []) as Array<{
    id: { en: string; es: string };
    en: string;
    es: string;
  }>;
  const galleryImages = (data.galleryImages ?? []) as Array<{
    src: string;
    alt: { en: string; es: string };
  }>;

  // First 3 paragraphs in left column, last one full-width
  const leftParagraphs = paragraphs.slice(0, 3);
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
        {/* LEFT — text */}
        <div className="md:col-span-6 md:pt-1">
          <Reveal preset="up" delay={0.10}>
            <h2 className="text-2xl md:text-4xl font-semibold leading-tight">
              {heading}
            </h2>
          </Reveal>

          <Reveal preset="fade" delay={0.22}>
            <div className="mt-6 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
          </Reveal>

          <div className="mt-7 max-w-[42ch] space-y-6">
            {leftParagraphs.map((p, i) => (
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

        {/* RIGHT — image */}
        <div className="md:col-span-6">
          <ScrollDrift fromX={18} toX={-26} reveal align="right" className="w-full">
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
                objectPosition="50% 55%"
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

        {/* Full-width continuation */}
        {bottomParagraph && (
          <div className="md:col-span-12 -mt-2 md:-mt-4">
            <div className="max-w-[1120px] mx-auto">
              <Sub
                id={t(bottomParagraph.id, lang)}
                preset="fade"
                className="mt-0 !min-h-0 !mb-0"
              >
                {lang === "es" ? bottomParagraph.es : bottomParagraph.en}
              </Sub>
            </div>
          </div>
        )}

        {/* Bottom gallery */}
        {galleryImages.length > 0 && (
          <div className="md:col-span-12 mt-6 md:mt-8">
            <div className="max-w-[1120px] mx-auto">
              <div className="mt-8 w-full grid gap-4 md:grid-cols-2 md:gap-6">
                {galleryImages.map((img, i) => (
                  <ScrollDrift
                    key={i}
                    fromX={i % 2 === 0 ? -14 : 14}
                    toX={i % 2 === 0 ? 14 : -14}
                    reveal
                    align={i % 2 === 0 ? "left" : "right"}
                    className="w-full"
                  >
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.45)] h-[38vh] md:h-[45vh] bg-[var(--olivea-cream)]/60">
                      <ParallaxImage
                        src={img.src}
                        alt={t(img.alt, lang)}
                        heightVh={45}
                        speed={0.10}
                        className="h-full"
                        fit="cover"
                        objectPosition="50% 50%"
                      />
                    </div>
                  </ScrollDrift>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StickyBlock>
  );
}
