"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import Sub from "@/components/scroll/Sub";
import ParallaxImage from "@/components/scroll/ParallaxImage";
import ScrollDrift from "@/components/scroll/ScrollDrift";
import type { SectionProps } from "./types";
import { t, tm } from "./md";

export default function TableSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "table";
  const heading = t(data.heading, lang);
  const imgSrc = data.image?.src ?? "/images/farm/dining.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Rhythm and hospitality";
  const caption = t(data.caption, lang);
  const hospitalityParagraphs = (data.hospitality ?? []) as Array<{ en: string; es: string }>;
  const galleryImages = (data.galleryImages ?? []) as Array<{ src: string; alt: { en: string; es: string } }>;

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      containerClassName="w-full md:max-w-[min(1220px,94vw)] md:mx-auto"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      title={null}
    >
      <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="md:col-span-6 md:pt-1">
          <Reveal preset="up" delay={0.10}>
            <h2 className="text-2xl md:text-4xl font-semibold leading-tight">
              {heading}
            </h2>
          </Reveal>

          <Reveal preset="fade" delay={0.22}>
            <div className="mt-6 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
          </Reveal>

          <div className="mt-8">
            <Sub id="hospitality" preset="up">
              {hospitalityParagraphs.map((p, i) => (
                <p key={i} className={i > 0 ? "mt-3" : undefined}>
                  {t(p, lang)}
                </p>
              ))}
            </Sub>

            <Sub id="narrative" preset="fade" className="mt-7 !min-h-0">
              {t(data.narrative, lang)}
            </Sub>

            <Sub id="terrace" preset="fade" className="mt-7 !min-h-0">
              {tm(data.terrace, lang)}
            </Sub>
          </div>
        </div>

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
                objectPosition="50% 50%"
              />
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/26 via-black/10 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-white/10" />
              </div>
            </div>
          </ScrollDrift>

          <Reveal preset="fade" delay={0.12}>
            <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--olivea-ink)]/55">
              <span className="h-[1px] w-10 bg-black/10" />
              <span>{caption}</span>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-12 mt-6 md:mt-8">
          <div className="max-w-[1120px] mx-auto">
            <div className="mt-8 w-full grid gap-4 md:grid-cols-2 md:gap-6">
              {galleryImages[0] && (
                <ScrollDrift fromX={-14} toX={14} reveal align="left" className="w-full">
                  <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.45)] h-[38vh] md:h-[45vh]">
                    <ParallaxImage
                      src={galleryImages[0].src}
                      alt={t(galleryImages[0].alt, lang)}
                      heightVh={45}
                      speed={0.10}
                      className="h-full"
                    />
                  </div>
                </ScrollDrift>
              )}

              {galleryImages[1] && (
                <ScrollDrift fromX={14} toX={-14} reveal align="right" className="w-full">
                  <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.45)] h-[38vh] md:h-[45vh]">
                    <ParallaxImage
                      src={galleryImages[1].src}
                      alt={t(galleryImages[1].alt, lang)}
                      heightVh={45}
                      speed={0.10}
                      className="h-full"
                    />
                  </div>
                </ScrollDrift>
              )}
            </div>
          </div>
        </div>
      </div>
    </StickyBlock>
  );
}
