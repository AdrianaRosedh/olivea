// lib/sections.ts
export type SectionId = "casa" | "farmtotable" | "cafe";

export type Lang = "es" | "en";

export type Section = {
  id: SectionId;
  /** path segment after locale, e.g. /es/<slug> */
  slug: string; // "casa" | "farmtotable" | "cafe"
  labels: Record<Lang, { short: string; full: string }>;
};

export const SECTIONS: Section[] = [
  {
    id: "casa",
    slug: "casa",
    labels: {
      es: { short: "Hotel",        full: "Casa Olivea" },
      en: { short: "Hotel",        full: "Casa Olivea" },
    },
  },
  {
    id: "farmtotable",
    slug: "farmtotable",
    labels: {
      es: { short: "Restaurante",  full: "Olivea Farm To Table" },
      en: { short: "Restaurant",   full: "Olivea Farm To Table" },
    },
  },
  {
    id: "cafe",
    slug: "cafe",
    labels: {
      es: { short: "Café",         full: "Olivea Café" },
      en: { short: "Café",         full: "Olivea Café" },
    },
  },
];

/** Fast lookup maps */
export const byId   = Object.fromEntries(SECTIONS.map(s => [s.id, s])) as Record<SectionId, Section>;
export const bySlug = Object.fromEntries(SECTIONS.map(s => [s.slug, s])) as Record<string, Section>;

/** Helpers */
export function getLangFromPath(pathname: string): Lang {
  return pathname.startsWith("/en") ? "en" : "es";
}

/** Returns active section (or null) and lang based on pathname. */
export function getActiveSection(pathname: string): { lang: Lang; section: Section | null } {
  const lang = getLangFromPath(pathname);
  // path like /es/casa/... -> slug = "casa"
  const seg = pathname.split("/")[2] ?? "";
  const section = bySlug[seg] ?? null;
  return { lang, section };
}

/** Build absolute hrefs per section for a given lang. */
export function sectionHref(id: SectionId, lang: Lang): string {
  return `/${lang}/${byId[id].slug}`;
}

/** Navbar center items: short label if inactive, full if active (matches your UX). */
export function buildCenterNavItems(pathname: string) {
  const { lang, section } = getActiveSection(pathname);
  return SECTIONS.map((s) => ({
    id: s.id,
    href: sectionHref(s.id, lang),
    isActive: section?.id === s.id,
    label: s.labels[lang][section?.id === s.id ? "full" : "short"],
  }));
}

/** Where should the Reserve button default to on this page? */
export function reserveDefault(pathname: string): SectionId {
  const { section } = getActiveSection(pathname);
  return section?.id ?? "farmtotable";
}
