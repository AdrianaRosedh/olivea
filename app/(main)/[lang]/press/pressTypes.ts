// app/(main)/[lang]/press/pressTypes.ts

export type Lang = "es" | "en";
export type Identity = "all" | "olivea" | "hotel" | "restaurant" | "cafe";
export type ItemKind = "all" | "award" | "mention";

export type PressLink = { label: string; href: string };

export type PressCover = {
  src: string; // e.g. "/images/press/mentions/wsj-2026.jpg"
  alt?: string;
};

export type PressItem = {
  kind: "award" | "mention";
  id: string;

  // ✅ required: normalized ISO date string YYYY-MM-DD
  publishedAt: string;

  issuer: string;
  for: Exclude<Identity, "all">; // olivea | hotel | restaurant | cafe
  title: string; // localized per file
  section?: string;
  tags?: string[];
  links: PressLink[];
  blurb: string;

  // ✅ optional: for press mentions (thumbnails)
  cover?: PressCover;
};