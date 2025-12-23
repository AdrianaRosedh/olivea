"use client";

import { useMemo } from "react";
import MobileSectionNav, {
  type MobileSectionNavItem,
} from "@/components/navigation/MobileSectionNav";
import type { Lang, PhilosophySection } from "./philosophyTypes";

export default function PhilosophyMobileNav({
  lang,
  sections,
}: {
  lang: Lang;
  sections: PhilosophySection[];
}) {
  const items: MobileSectionNavItem[] = useMemo(() => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);

    return sorted.map((s) => ({
      id: s.id,
      // short & scan-friendly on mobile
      label: s.title,
    }));
  }, [sections]);

  if (!items.length) return null;

  return (
    <div className="lg:hidden">
      <MobileSectionNav
        items={items}
        lang={lang}
        pageTitle={{ es: "Filosofía", en: "Philosophy" }}
      />
    </div>
  );
}
