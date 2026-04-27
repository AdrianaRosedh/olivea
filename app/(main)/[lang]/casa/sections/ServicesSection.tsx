import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import ServicesGrid from "@/components/mdx/ServicesGrid";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function ServicesSection({ data, lang }: SectionProps) {
  const sectionId = t(data.sectionId, lang) || "services";
  const heading = t(data.heading, lang);
  const cards = (data.cards ?? []) as Array<{
    id: string;
    title: { en: string; es: string };
    text: { en: string; es: string };
  }>;

  const items = cards.map((c) => ({
    id: c.id,
    title: t(c.title, lang),
    text: t(c.text, lang),
  }));

  return (
    <StickyBlock
      id={sectionId}
      variant="top"
      title={<Reveal preset="up"><h2 className="text-2xl md:text-4xl font-semibold leading-tight">{heading}</h2></Reveal>}
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
    >
      <ServicesGrid items={items} />
    </StickyBlock>
  );
}
