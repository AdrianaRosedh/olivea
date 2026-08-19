import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import ServicesGrid from "@/components/mdx/ServicesGrid";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function PantrySection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "pantry";
  const heading = t(data.heading, lang);
  const introParagraphs = (data.intro ?? []) as Array<{ en: string; es: string }>;
  const cards = (data.cards ?? []) as Array<{
    id: string;
    title: { en: string; es: string };
    body: { en: string; es: string };
  }>;

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      title={
        <Reveal preset="up">
          <h2 className="text-2xl md:text-4xl font-semibold">
            {heading}
          </h2>
        </Reveal>
      }
    >
      <Reveal preset="fade" delay={0.12}>
        <div className="mt-6 max-w-[78ch] text-[15.5px] md:text-[16.5px] leading-relaxed text-[var(--olivea-ink)]/85">
          {introParagraphs.map((p, i) => (
            <p key={i} className={i > 0 ? "mt-3" : undefined}>
              {t(p, lang)}
            </p>
          ))}
        </div>
      </Reveal>

      <ServicesGrid
        items={cards.map((c) => ({
          id: c.id,
          title: t(c.title, lang),
          text: t(c.body, lang),
        }))}
      />
    </StickyBlock>
  );
}
