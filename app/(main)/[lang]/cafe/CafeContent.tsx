"use client";

import ScrollLimiter from "@/components/scroll/ScrollLimiter";
import HeroSection from "./sections/HeroSection";
import ExperienceSection from "./sections/ExperienceSection";
import BreakfastSection from "./sections/BreakfastSection";
import BreadSection from "./sections/BreadSection";
import PadelSection from "./sections/PadelSection";
import GallerySection from "./sections/GallerySection";
import MenuSection from "./sections/MenuSection";
import FaqSection from "./sections/FaqSection";
import type { Lang, SectionData } from "./sections/types";

interface CafeContentProps {
  lang: Lang;
  sections: SectionData[];
}

function findSection(sections: SectionData[], id: string): SectionData {
  return sections.find((s) => s.id === id) ?? {};
}

export default function CafeContent({ lang, sections }: CafeContentProps) {
  return (
    <ScrollLimiter anchorSelector=".subsection">
      <HeroSection data={findSection(sections, "hero")} lang={lang} />
      <ExperienceSection data={findSection(sections, "experience")} lang={lang} />
      <BreakfastSection data={findSection(sections, "breakfast")} lang={lang} />
      <BreadSection data={findSection(sections, "bread")} lang={lang} />
      <PadelSection data={findSection(sections, "padel")} lang={lang} />
      <GallerySection data={findSection(sections, "gallery")} lang={lang} />
      <MenuSection data={findSection(sections, "menu")} lang={lang} />
      <FaqSection data={findSection(sections, "faq")} lang={lang} />
    </ScrollLimiter>
  );
}
