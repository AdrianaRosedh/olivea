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

  // required: normalized ISO date string YYYY-MM-DD
  publishedAt: string;

  issuer: string;
  for: Exclude<Identity, "all">; // olivea | hotel | restaurant | cafe
  title: string; // localized per file
  section?: string;
  tags?: string[];
  links: PressLink[];
  blurb: string;

  // optional: for press mentions (thumbnails)
  cover?: PressCover;

  /**
   * optional: pin a *single* award to always appear as "Featured"
   * (ignored for mentions automatically)
   */
  starred?: boolean;
};

/* =========================
   PRESS KIT MANIFEST TYPES
   ========================= */

export type PressMediaCategory =
  | "hero"
  | "garden"
  | "restaurant"
  | "hotel"
  | "cafe"
  | "food"
  | "people"
  | "architecture"
  | "other";

export type PressMediaItem = {
  id: string;
  category: PressMediaCategory;
  title: Record<Lang, string>;
  web: string; // site path, e.g. "/images/press/media/web/cafe.jpg"
  hires?: string; // site path, e.g. "/images/press/media/hires/Cafe.jpg"
  credit?: string;
  caption?: Record<Lang, string>;
};

export type PressManifest = {
  version: string; // e.g. "2026.03"
  updatedAt: string; // YYYY-MM-DD
  contactEmail: string;

  downloads: {
    fullKit: string;
    logos: string;
    photos: string;
    factsheet: string;
  };

  copy: Record<
    Lang,
    {
      headline: string;
      subhead: string;
      usageTitle: string;
      usageBody: string;
      boilerplate30: string;
      boilerplate80: string;
    }
  >;

  media: PressMediaItem[];
};