import StickyBlock from "@/components/scroll/StickyBlock";
import Reveal from "@/components/scroll/Reveal";
import Farmpop from "@/components/ui/popup/farmpop";
import CardParallax from "@/components/mdx/CardParallax";
import type { SectionProps } from "./types";
import { t, tm } from "./md";

const tabEmojis: Record<string, string> = {
  menu: "\uD83C\uDF7D\uFE0F",
  pairing: "\uD83C\uDF3F",
  spirits: "\uD83E\uDD43",
  wine: "\uD83C\uDF77",
  drinks: "\uD83C\uDF79",
};

const cardEmojis = ["\uD83C\uDF3F", "\uD83C\uDF77", "\uD83C\uDF31", "\uD83E\uDED2"];

export default function MenuSection({ data, lang }: SectionProps) {
  const heading = t(data.heading, lang);
  const imgSrc = data.image?.src ?? "/images/farm/garden7.jpg";
  const imgAlt = t(data.image?.alt, lang) || "The garden";
  const popupTitle = t(data.popupTitle, lang) || "Live menu";
  const popupLabel = t(data.popupLabel, lang) || "View live menu";
  const menuTabs = (data.menuTabs ?? []) as Array<{
    id: string;
    label: { en: string; es: string };
    canvaUrl: string;
  }>;
  const infoCards = (data.infoCards ?? []) as Array<{
    title: { en: string; es: string };
    body: { en: string; es: string };
  }>;

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
      <div className="relative mt-6">
        <div
          className="
            md:hidden
            relative overflow-hidden rounded-[22px]
            ring-1 ring-black/10
            h-[190px]
          "
        >
          <CardParallax
            src={imgSrc}
            alt={imgAlt}
            speed={0.12}
            fit="cover"
            objectPosition="35% 82%"
            sizes="100vw"
            loading="lazy"
            placeholder="empty"
            className="-inset-[28px]"
            surfaceClassName="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
        </div>

        <div
          className="
            hidden md:block
            relative overflow-hidden rounded-[22px]
            ring-1 ring-black/10
            h-[300px]
          "
        >
          <CardParallax
            src={imgSrc}
            alt={imgAlt}
            speed={0.16}
            fit="cover"
            objectPosition="40% 55%"
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
        <p className="mx-auto max-w-[70ch] text-[17px] md:text-[18px] leading-[1.7] text-[var(--olivea-ink)]/90">
          {tm(data.body, lang)}
        </p>

        <div className="mt-6 flex justify-center">
          <Farmpop
            title={popupTitle}
            label={popupLabel}
            initialTabId="menu"
            tabs={menuTabs.map((tab) => ({
              id: tab.id,
              label: t(tab.label, lang),
              url: tab.canvaUrl,
              emoji: tabEmojis[tab.id] || "\uD83C\uDF7D\uFE0F",
            }))}
            triggerClassName="
              rounded-full px-7 md:px-8 py-3 text-[13.5px] tracking-[0.20em] uppercase font-semibold
              bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)]
              shadow-[0_10px_28px_rgba(0,0,0,0.14)] ring-1 ring-white/10
              transition-transform duration-300 hover:-translate-y-[1px]
            "
          />
        </div>

        <div className="mt-7 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>

      <div className="mt-8 grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {infoCards.map((card, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-white/22 backdrop-blur-sm ring-1 ring-black/8 px-5 py-5 md:px-6 md:py-6"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--olivea-olive)]/35" />
            <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--olivea-olive)]/85">
              {cardEmojis[i] ?? "\uD83C\uDF3F"} {t(card.title, lang)}
            </div>
            <p className="mt-3 text-[15px] leading-[1.65] text-[var(--olivea-ink)]/82">
              {tm(card.body, lang)}
            </p>
          </div>
        ))}
      </div>
    </StickyBlock>
  );
}
