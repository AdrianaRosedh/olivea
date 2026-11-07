import PageSignOff from "@/components/sections/PageSignOff";
import StatementMoment from "@/components/sections/StatementMoment";
import ScrollLimiter from "@/components/scroll/ScrollLimiter";
import HeroSection from "./sections/HeroSection";
import RoomsSection from "./sections/RoomsSection";
import DesignSection from "./sections/DesignSection";
import CourtyardSection from "./sections/CourtyardSection";
import MorningsSection from "./sections/MorningsSection";
import PracticalSection from "./sections/PracticalSection";
import GallerySection from "./sections/GallerySection";
import ServicesSection from "./sections/ServicesSection";
import FaqSection from "./sections/FaqSection";
import type { Lang, SectionData } from "./sections/types";

interface CasaContentProps {
  lang: Lang;
  sections: SectionData[];
}

function findSection(sections: SectionData[], id: string): SectionData {
  return sections.find((s) => s.id === id) ?? {};
}

export default function CasaContent({ lang, sections }: CasaContentProps) {
  return (
    // data-editorial: trial of a flatter, print-like treatment (main.css,
    // "Editorial trial"). Remove the attribute to return to the card look.
    <div data-editorial="" className="contents">
    <ScrollLimiter anchorSelector=".subsection">
      <HeroSection data={findSection(sections, "hero")} lang={lang} />
      <RoomsSection data={findSection(sections, "rooms")} lang={lang} />
      <DesignSection data={findSection(sections, "design")} lang={lang} />
      <StatementMoment lang={lang} house="hotel" objectPosition="50% 45%" />
      <CourtyardSection data={findSection(sections, "courtyard")} lang={lang} />
      <MorningsSection data={findSection(sections, "mornings")} lang={lang} />
      <PracticalSection data={findSection(sections, "practical")} lang={lang} />
      <GallerySection data={findSection(sections, "gallery")} lang={lang} />
      <ServicesSection data={findSection(sections, "services")} lang={lang} />
      <FaqSection data={findSection(sections, "faq")} lang={lang} />
    </ScrollLimiter>
    <PageSignOff lang={lang} house="hotel" />
    </div>
  );
}
