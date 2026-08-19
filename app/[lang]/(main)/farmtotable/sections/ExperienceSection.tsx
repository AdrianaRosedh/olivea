import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import Sub from "@/components/scroll/Sub";
import StatChips from "@/components/mdx/StatChips";
import FieldNote from "@/components/mdx/FieldNote";
import ScrollGrowImageBand from "@/components/mdx/ScrollGrowImageBand";
import type { SectionProps } from "./types";
import { t, tm } from "./md";

export default function ExperienceSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "experience";
  const heading = t(data.heading, lang);
  const subtitle = t(data.subtitle, lang);
  const imgSrc = data.image?.src ?? "/images/farm/garden.jpg";
  const imgAlt = t(data.image?.alt, lang) || "Olivea Farm To Table garden";
  const caption = t(data.caption, lang);
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
      <div className="max-w-[860px]">
        <Reveal preset="up" delay={0.08}>
          <h2 className="text-2xl md:text-4xl font-semibold leading-tight">
            {heading}
          </h2>
        </Reveal>

        <Reveal preset="fade" delay={0.18}>
          <p className="mt-3 text-[13px] md:text-[14px] text-[var(--olivea-ink)]/60 leading-relaxed">
            {subtitle}
          </p>
        </Reveal>

        <Reveal preset="fade" delay={0.26}>
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
        </Reveal>
      </div>

      <Sub id="origin" preset="blur-up" className="mt-10">
        {tm(data.origin, lang)}
      </Sub>

      <Reveal preset="fade" delay={0.18}>
        <div className="mt-8">
          <StatChips items={stats} />
        </div>
      </Reveal>

      <ScrollGrowImageBand
        src={imgSrc}
        alt={imgAlt}
        startH="150px"
        endH="460px"
        delayStart={0.22}
        holdAt={0.94}
        scrollContainerSelector="main"
      />

      <Reveal preset="fade" delay={0.08}>
        <div className="mt-4 max-w-275 mx-auto flex items-center gap-3 text-[12px] text-[var(--olivea-ink)]/55">
          <span className="h-[1px] w-10 bg-black/10" />
          <span>{caption}</span>
        </div>
      </Reveal>

      <Sub id="balance" preset="up" className="mt-12">
        {t(data.balance, lang)}
      </Sub>

      <Reveal preset="fade" delay={0.14}>
        <div className="mt-10">
          <FieldNote>{tm(data.fieldNote, lang)}</FieldNote>
        </div>
      </Reveal>

      <Sub id="values" preset="fade" className="!min-h-0 !mb-0 mt-10">
        {tm(data.values, lang)}
      </Sub>
    </StickyBlock>
  );
}
