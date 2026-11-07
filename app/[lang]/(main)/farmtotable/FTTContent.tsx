import StatementMoment from "@/components/sections/StatementMoment";
import PageSignOff from "@/components/sections/PageSignOff";
import ScrollLimiter from "@/components/scroll/ScrollLimiter";
import HeroSection from "./sections/HeroSection";
import ExperienceSection from "./sections/ExperienceSection";
import KitchenSection from "./sections/KitchenSection";
import TableSection from "./sections/TableSection";
import PantrySection from "./sections/PantrySection";
import GallerySection from "./sections/GallerySection";
import MenuSection from "./sections/MenuSection";
import FaqSection from "./sections/FaqSection";
import type { Lang, SectionData } from "./sections/types";

interface FTTContentProps {
  lang: Lang;
  sections: SectionData[];
}

function findSection(sections: SectionData[], id: string): SectionData {
  return sections.find((s) => s.id === id) ?? {};
}

export default function FTTContent({ lang, sections }: FTTContentProps) {
  return (
    // data-editorial: flatter, print-like treatment shared with Casa
    // (main.css, "Editorial trial").
    <div data-editorial="" className="contents">
    <ScrollLimiter anchorSelector=".subsection">
      <HeroSection data={findSection(sections, "hero")} lang={lang} />
      <ExperienceSection data={findSection(sections, "experience")} lang={lang} />
      <KitchenSection data={findSection(sections, "kitchen")} lang={lang} />
      <StatementMoment lang={lang} house="restaurant" objectPosition="50% 58%" />
      <TableSection data={findSection(sections, "table")} lang={lang} />
      <PantrySection data={findSection(sections, "pantry")} lang={lang} />
      <GallerySection data={findSection(sections, "gallery")} lang={lang} />
      <MenuSection data={findSection(sections, "menu")} lang={lang} />
      <FaqSection data={findSection(sections, "faq")} lang={lang} />
    </ScrollLimiter>
    <PageSignOff lang={lang} house="restaurant" />
    </div>
  );
}
