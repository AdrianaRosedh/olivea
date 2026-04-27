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
    <ScrollLimiter anchorSelector=".subsection">
      <HeroSection data={findSection(sections, "hero")} lang={lang} />
      <RoomsSection data={findSection(sections, "rooms")} lang={lang} />
      <DesignSection data={findSection(sections, "design")} lang={lang} />
      <CourtyardSection data={findSection(sections, "courtyard")} lang={lang} />
      <MorningsSection data={findSection(sections, "mornings")} lang={lang} />
      <PracticalSection data={findSection(sections, "practical")} lang={lang} />
      <GallerySection data={findSection(sections, "gallery")} lang={lang} />
      <ServicesSection data={findSection(sections, "services")} lang={lang} />
      <FaqSection data={findSection(sections, "faq")} lang={lang} />
    </ScrollLimiter>
  );
}
