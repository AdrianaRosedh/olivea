import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import Sub from "@/components/scroll/Sub";
import StatChips from "@/components/mdx/StatChips";
import FieldNote from "@/components/mdx/FieldNote";
import ScrollGrowImageBand from "@/components/mdx/ScrollGrowImageBand";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function ExperienceSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "experiencia";
  const heading = t(data.heading, lang);
  const subtitle = t(data.subtitle, lang);
  const origin = t(data.origin, lang);
  const imgSrc = data.image?.src ?? "/images/cafe/cafe.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Olivea Cafe atmosphere";
  const caption = t(data.caption, lang);
  const fieldNote = t(data.fieldNote, lang);
  const coffee = (data.coffee ?? []) as Array<{ id: { en: string; es: string }; en: string; es: string }>;
  const bar = data.bar as { id: { en: string; es: string }; en: string; es: string } | undefined;
  const stats = (data.stats ?? []) as Array<{ label: { en: string; es: string }; value: { en: string; es: string } }>;

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      containerClassName="w-full md:max-w-[min(1120px,94vw)] md:mx-auto"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      title={null}
    >
      {/* Title block */}
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
          <div className="mt-5 md:mt-6 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
        </Reveal>
      </div>

      {/* Opening */}
      {origin && (
        <Sub id="origin" preset="blur-up" className="mt-7 md:mt-8 !min-h-0">
          {origin}
        </Sub>
      )}

      {/* Specs */}
      {stats.length > 0 && (
        <Reveal preset="fade" delay={0.18}>
          <div className="mt-6 md:mt-7">
            <StatChips
              items={stats.map((s) => ({
                label: t(s.label, lang),
                value: t(s.value, lang),
              }))}
            />
          </div>
        </Reveal>
      )}

      {/* Scroll-grow hero band */}
      <ScrollGrowImageBand
        src={imgSrc}
        alt={imgAlt}
        startH="130px"
        endH="400px"
        delayStart={0.22}
        holdAt={0.94}
        scrollContainerSelector="main"
      />

      {/* Caption */}
      {caption && (
        <Reveal preset="fade" delay={0.08}>
          <div className="mt-3 max-w-275 mx-auto flex items-center gap-3 text-[12px] text-[var(--olivea-ink)]/55">
            <span className="h-[1px] w-10 bg-black/10" />
            <span>{caption}</span>
          </div>
        </Reveal>
      )}

      {/* Coffee stack */}
      {coffee.length > 0 && (
        <div className="mt-8 md:mt-9 max-w-[860px] space-y-6 md:space-y-7">
          {coffee.map((item, i) => (
            <Sub
              key={i}
              id={t(item.id, lang)}
              preset={i === 0 ? "up" : "fade"}
              className="!min-h-0 !mb-0"
            >
              {lang === "es" ? item.es : item.en}
            </Sub>
          ))}
        </div>
      )}

      {/* Field note */}
      {fieldNote && (
        <Reveal preset="fade" delay={0.14}>
          <div className="mt-7 md:mt-8">
            <FieldNote>{fieldNote}</FieldNote>
          </div>
        </Reveal>
      )}

      {/* Bar / forward */}
      {bar && (
        <Sub id={t(bar.id, lang)} preset="fade" className="mt-7 md:mt-8 !min-h-0 !mb-0">
          {lang === "es" ? bar.es : bar.en}
        </Sub>
      )}
    </StickyBlock>
  );
}
