"use client";

import { useEffect } from "react";
import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import Farmpop from "@/components/ui/popup/farmpop";
import CardParallax from "@/components/mdx/CardParallax";
import type { SectionProps } from "./types";
import { t, tm } from "./md";

export default function MenuSection({ data, lang }: SectionProps) {
  const heading = t(data.heading, lang) || "The menu";
  const imgSrc = data.image?.src ?? "/images/cafe/garden2.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Olivea Cafe — menu and atmosphere";
  const description = data.description
    ? tm(data.description, lang)
    : null;

  const farmpop = data.farmpop as
    | { title: { en: string; es: string }; label: { en: string; es: string }; canvaUrl: string }
    | undefined;

  const infoCards = (data.infoCards ?? []) as Array<{
    label: { en: string; es: string };
    text: { en: string; es: string };
  }>;

  const emojiMap: Record<number, string> = { 0: "\u2615", 1: "\uD83C\uDF75", 2: "\uD83C\uDF77" };

  useEffect(() => {
    const open = () => {
      const btn = document.querySelector(".js-cafe-menu-trigger");
      if (btn && "click" in btn) {
        (btn as HTMLElement).click();
      }
    };

    window.addEventListener("olivea:cafe:menu:open", open);
    return () => window.removeEventListener("olivea:cafe:menu:open", open);
  }, []);

  return (
    <StickyBlock
      id="menu"
      variant="top"
      containerClassName="w-full md:max-w-[min(1180px,92vw)] md:mx-auto"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start overflow-hidden"
      title={
        <Reveal preset="up">
          <h2 className="text-2xl md:text-4xl font-semibold">{heading}</h2>
        </Reveal>
      }
    >
      {/* IMAGE */}
      <div className="relative mt-6">
        {/* Mobile */}
        <div className="md:hidden relative overflow-hidden rounded-[22px] ring-1 ring-black/10 h-[190px]">
          <CardParallax
            src={imgSrc}
            alt={imgAlt}
            speed={0.12}
            fit="cover"
            objectPosition="50% 60%"
            sizes="100vw"
            loading="lazy"
            placeholder="empty"
            className="-inset-[99px]"
            surfaceClassName="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
        </div>

        {/* Desktop */}
        <div className="hidden md:block relative overflow-hidden rounded-[22px] ring-1 ring-black/10 h-[300px]">
          <CardParallax
            src={imgSrc}
            alt={imgAlt}
            speed={0.16}
            fit="cover"
            objectPosition="50% 52%"
            sizes="(max-width: 768px) 100vw, 1180px"
            loading="lazy"
            placeholder="empty"
            className="-inset-[34px]"
            surfaceClassName="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/14 via-transparent to-transparent" />
        </div>
      </div>

      <div className="mt-8 md:mt-9 text-center">
        {description && (
          <p className="mx-auto max-w-[72ch] text-[17px] md:text-[18px] leading-[1.7] text-[var(--olivea-ink)]/90">
            {description}
          </p>
        )}

        {farmpop && (
          <div className="mt-6 flex justify-center">
            <Farmpop
              title={t(farmpop.title, lang)}
              label={t(farmpop.label, lang)}
              canvaUrl={farmpop.canvaUrl}
              triggerClassName="
                js-cafe-menu-trigger
                rounded-full px-7 md:px-8 py-3 text-[13.5px] tracking-[0.20em] uppercase font-semibold
                bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)]
                shadow-[0_10px_28px_rgba(0,0,0,0.14)] ring-1 ring-white/10
                transition-transform duration-300 hover:-translate-y-[1px]
              "
            />
          </div>
        )}

        <div className="mt-7 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>

      {/* DockLeft anchors */}
      <div className="sr-only">
        <div id="espresso" className="subsection" />
        <div id="filter" className="subsection" />
        <div id="tea" className="subsection" />
        <div id="cold" className="subsection" />
      </div>

      {/* INFO CARDS */}
      {infoCards.length > 0 && (
        <div className="mt-8 grid gap-5 md:gap-6 md:grid-cols-3">
          {infoCards.map((card, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-white/22 backdrop-blur-sm ring-1 ring-black/8 px-5 py-5 md:px-6 md:py-6"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--olivea-olive)]/35" />
              <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--olivea-olive)]/85">
                {emojiMap[i] ?? ""} {t(card.label, lang)}
              </div>
              <p className="mt-3 text-[15px] leading-[1.65] text-[var(--olivea-ink)]/82">
                {t(card.text, lang)}
              </p>
            </div>
          ))}
        </div>
      )}
    </StickyBlock>
  );
}
