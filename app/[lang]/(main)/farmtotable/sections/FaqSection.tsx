import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import ModernFAQ from "@/components/ui/ModernFAQ";
import type { SectionProps } from "./types";
import { t, tm } from "./md";

export default function FaqSection({ data, lang }: SectionProps) {
  const heading = t(data.heading, lang) || "Before you reserve";
  const items = (data.items ?? []) as Array<{
    q: { en: string; es: string };
    a: { en: string; es: string };
  }>;

  return (
    <StickyBlock
      id="faq"
      variant="top"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[min(1080px,92vw)] md:mx-auto"
      title={
        <Reveal preset="up">
          <h2 className="text-2xl md:text-4xl font-semibold">{heading}</h2>
        </Reveal>
      }
    >
      <ModernFAQ
        items={items.map((item) => ({
          q: t(item.q, lang),
          a: <p>{tm(item.a, lang)}</p>,
        }))}
      />
    </StickyBlock>
  );
}
