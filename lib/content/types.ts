// lib/content/types.ts
// ─────────────────────────────────────────────────────────────────────
// Canonical TypeScript interfaces for ALL editable content on the site.
// These types are the single source of truth — admin editors write to
// them, public pages read from them, and the data source (static →
// Supabase) is hidden behind a thin provider.
// ─────────────────────────────────────────────────────────────────────

/* ── Primitives ── */

/** Bilingual text field — every user-facing string needs ES + EN */
export interface Bilingual {
  es: string;
  en: string;
}

/** Bilingual rich text (HTML/MDX string) */
export interface BilingualRich {
  es: string;
  en: string;
}

/** Image with alt text for accessibility */
export interface SiteImage {
  src: string;
  alt: Bilingual;
  width?: number;
  height?: number;
}

/** SEO / Open Graph metadata for any page */
export interface PageMeta {
  title: Bilingual;
  description: Bilingual;
  ogImage?: string;
  keywords?: string[];
}

/* ── Business Info (global, shared across pages) ── */

export interface BusinessHours {
  id: string;
  venue: "farmtotable" | "casa" | "cafe";
  label: Bilingual;
  schedule: Bilingual; // e.g. "Wed 5–8 · Fri 2:30–8:30 · Sun 2–7"
  sortOrder: number;
}

export interface ContactInfo {
  address: Bilingual;
  email: string;
  phone: string;
  googleMapsUrl: string;
  googleMapsEmbed: string;
  coordinates: { lat: number; lng: number };
}

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface GlobalSettings {
  siteName: string;
  tagline: Bilingual; // "Where the garden is the essence."
  defaultLocale: "es" | "en";
  contactInfo: ContactInfo;
  hours: BusinessHours[];
  socials: SocialLink[];
  defaultOgImage: string;
  twitterHandle: string;
}

/* ── Navigation ── */

export interface NavItem {
  id: string;
  label: Bilingual;
  href: string;
  section: "main" | "more";
  sortOrder: number;
  visible: boolean;
}

export interface DrawerContent {
  mainLinks: NavItem[];
  moreLinks: NavItem[];
  copyright: Bilingual;
  seeMore: Bilingual;
  hide: Bilingual;
}

export interface FooterContent {
  careers: Bilingual;
  legal: Bilingual;
}

/* ── Page Content Blocks ── */

/** A hero section (used on farmtotable, casa, cafe pages) */
export interface HeroBlock {
  id: string;
  page: string;
  kicker?: Bilingual;
  headline: Bilingual;
  subheadline?: Bilingual;
  image: SiteImage;
  ctas?: HeroCta[];
}

export interface HeroCta {
  label: Bilingual;
  href: string;
  style: "primary" | "ghost";
}

/** FAQ item for structured data + on-page rendering */
export interface FaqItem {
  id: string;
  page: string;
  question: Bilingual;
  answer: Bilingual;
  sortOrder: number;
}

/** A generic content section on a page */
export interface ContentSection {
  id: string;
  page: string;
  slug: string;
  title?: Bilingual;
  body: BilingualRich;
  image?: SiteImage;
  sortOrder: number;
}

/* ── Page-Specific Types ── */

/** Home page */
export interface HomeContent {
  meta: PageMeta;
  hero: {
    title: Bilingual;
    subtitle: Bilingual;
    ctaRestaurant: Bilingual;
    ctaCasa: Bilingual;
    image: SiteImage;
  };
  /** Active hero video set — admin can swap video without deploys */
  video: HeroVideo;
}

/** Farm To Table page */
export interface FarmToTableContent {
  meta: PageMeta;
  hero: HeroBlock;
  sections: ContentSection[];
  faq: FaqItem[];
}

/** Casa Olivea page */
export interface CasaContent {
  meta: PageMeta;
  hero: HeroBlock;
  sections: ContentSection[];
  faq: FaqItem[];
}

/** Café page */
export interface CafeContent {
  meta: PageMeta;
  hero: HeroBlock;
  sections: ContentSection[];
  faq: FaqItem[];
}

/** Contact page */
export interface ContactContent {
  meta: PageMeta;
  kicker: Bilingual;
  subtitle: Bilingual;
  actions: {
    maps: Bilingual;
    email: Bilingual;
    call: Bilingual;
  };
  labels: {
    address: Bilingual;
    email: Bilingual;
  };
  sections: {
    farmToTableTitle: Bilingual;
    casaCafeTitle: Bilingual;
  };
  footerNote: Bilingual;
  map: {
    iframeTitle: Bilingual;
    badgeLabel: Bilingual;
    badgeValue: Bilingual;
    googleMapsCta: Bilingual;
  };
}

/** Sustainability / Philosophy page */
export interface SustainabilityContent {
  meta: PageMeta;
  title: Bilingual;
  description: Bilingual;
  sections: SustainabilitySection[];
}

/** Press page */
export interface PressContent {
  meta: PageMeta;
  title: Bilingual;
  tagline: Bilingual;
  description: Bilingual[];
  articles: PressArticle[];
}

export interface PressArticle {
  id: string;
  slug: string;
  title: Bilingual;
  source: string;
  date: string;
  excerpt?: Bilingual;
  url?: string;
  coverImage?: SiteImage;
  sortOrder: number;
}

/** Journal */
export type JournalStatus = "draft" | "published" | "archived";

export interface JournalPostAuthor {
  id?: string;
  name: string;
}

export interface JournalPostGalleryImage {
  src: string;
  alt: string;
}

export interface JournalPost {
  id: string;
  title: Bilingual;
  slug: string;
  excerpt: Bilingual;
  body: BilingualRich;
  coverImage?: string;
  coverAlt?: string;
  author: string;
  /** Multi-author support — takes precedence over `author` when present */
  authors?: JournalPostAuthor[];
  /** End-of-article photo gallery for PhotoCarousel */
  gallery?: JournalPostGalleryImage[];
  status: JournalStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/** Careers page */
export interface CareersContent {
  meta: PageMeta;
  hero: {
    kicker: Bilingual;
    headline: Bilingual;
    description: Bilingual;
    image: SiteImage;
    signals: Array<{ label: Bilingual; text: Bilingual }>;
  };
  standards: {
    title: Bilingual;
    items: Bilingual[];
  };
  hiringSteps: Bilingual[];
  principlesTitle?: Bilingual;
  principles: Array<{ title: Bilingual; description: Bilingual }>;
  tracksTitle?: Bilingual;
  tracks: Array<{
    title: Bilingual;
    description: Bilingual;
    chips: string[];
  }>;
  openings: {
    title: Bilingual;
    openApplication: {
      label: Bilingual;
      description: Bilingual;
      ctaLabel: Bilingual;
      responseTime: Bilingual;
    };
    qualifications: {
      title: Bilingual;
      items: Bilingual[];
    };
  };
  application: {
    title: Bilingual;
    description: Bilingual;
    tip: {
      label: Bilingual;
      text: Bilingual;
    };
  };
}

/** Legal page */
export interface LegalContent {
  meta: PageMeta;
  title: Bilingual;
  description: Bilingual;
  sections: ContentSection[];
}

/** Team page */
export interface TeamContent {
  meta: PageMeta;
  title: Bilingual;
  description: Bilingual;
}

/** Not Found (404) */
export interface NotFoundContent {
  meta: PageMeta;
  message: Bilingual;
  cta: Bilingual;
}

/* ── Menus (already modeled in admin) ── */

export interface WineItem {
  id: string;
  category: string;
  name: string;
  winery: string;
  grape?: string;
  year?: number;
  priceGlass?: number;
  priceBottle?: number;
  tags: string[];
  available: boolean;
  sortOrder: number;
}

export interface DrinkItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  price?: number;
  tags: string[];
  available: boolean;
  sortOrder: number;
}

export interface SpiritItem {
  id: string;
  category: string;
  subcategory?: string;
  name: string;
  brand?: string;
  price?: number;
  available: boolean;
  sortOrder: number;
}

/* ── Media Library ── */

export interface MediaItem {
  id: string;
  src: string;
  alt: Bilingual;
  caption?: Bilingual;
  tags: string[];
  width?: number;
  height?: number;
  uploadedAt: string;
  uploadedBy: string;
}

/* ── Promotions ── */

export interface Promotion {
  id: string;
  title: Bilingual;
  description: Bilingual;
  image?: SiteImage;
  startDate: string;
  endDate?: string;
  active: boolean;
  venue: "farmtotable" | "casa" | "cafe" | "all";
}

/* ── Popups ── */

export type PopupFrequency = "onceEver" | "oncePerPopupId" | "oncePerDays";

export interface PopupRules {
  startsAt: string;          // ISO 8601
  endsAt: string;            // ISO 8601
  includePaths: string[];    // glob patterns
  excludePaths: string[];
  frequency: PopupFrequency;
  days?: number;             // for oncePerDays
}

export interface PopupTranslation {
  badge: string;
  title: string;
  excerpt: string;
  href?: string;
}

export interface PopupItem {
  id: string;
  enabled: boolean;
  kind: "journal" | "announcement";
  priority?: number;
  translations: {
    es: PopupTranslation;
    en: PopupTranslation;
  };
  media?: {
    coverSrc: string;
    coverAlt: Bilingual;
  };
  rules: PopupRules;
}

/* ── Banners ── */

export type BannerType = "notice" | "promo" | "warning";

export interface BannerTranslation {
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface BannerItem {
  id: string;
  enabled: boolean;
  type: BannerType;
  translations: {
    es: BannerTranslation;
    en: BannerTranslation;
  };
  startsAt?: string;
  endsAt?: string;
  dismissible: boolean;
  includePaths: string[];
  excludePaths: string[];
}

/* ── Press / Awards (full MDX articles) ── */

export type PressItemKind = "award" | "mention";
export type PressVenue = "olivea" | "hotel" | "restaurant" | "cafe";

export interface PressLink {
  label: string;
  href: string;
}

export interface PressCover {
  src: string;
  alt?: string;
}

export interface PressItemFull {
  kind: PressItemKind;
  id: string;
  publishedAt: string;       // YYYY-MM-DD
  issuer: string;
  for: PressVenue;
  title: string;             // per-language (from MDX file in es/ or en/)
  section?: string;
  tags?: string[];
  links: PressLink[];
  blurb: string;             // MDX body content
  cover?: PressCover;
  starred?: boolean;
}

export interface PressMediaItem {
  id: string;
  category: string;
  title: Bilingual;
  web: string;               // web-optimized image path
  hires?: string;            // high-res download path
  credit?: string;
  caption?: Bilingual;
}

export interface PressManifest {
  version: string;
  updatedAt: string;
  contactEmail: string;
  downloads: {
    fullKit: string;
    logos: string;
    photos: string;
    factsheet: string;
  };
  copy: {
    es: PressRoomCopy;
    en: PressRoomCopy;
  };
  media: PressMediaItem[];
}

export interface PressRoomCopy {
  headline: string;
  subhead: string;
  usageTitle: string;
  usageBody: string;
  boilerplate30: string;
  boilerplate80: string;
}

/* ── Sustainability / Philosophy sections (MDX) ── */

export interface SustainabilitySection {
  id: string;
  order: number;
  title: Bilingual;
  subtitle?: Bilingual;
  signals?: Bilingual[];     // key points / timeline markers
  practices?: Bilingual[];   // bulleted practices
  body: BilingualRich;       // MDX body content
}

/* ── Journal Article (full MDX with all frontmatter) ── */

export interface JournalAuthor {
  id: string;
  name: string;
}

export interface JournalArticleSeo {
  title: string;
  description: string;
  keywords?: string[];
  faq?: Array<{ q: string; a: string }>;
}

export interface JournalArticle {
  id: string;
  translationId: string;     // links ES ↔ EN versions
  lang: "es" | "en";
  slug: string;              // URL slug
  title: string;
  authors: JournalAuthor[];
  excerpt: string;
  description: string;
  publishedAt: string;       // YYYY-MM-DD
  pillar?: string;           // content pillar (territorio, etc.)
  tags: string[];
  cover: {
    src: string;
    alt: string;
  };
  seo: JournalArticleSeo;
  body: string;              // MDX content
  status: JournalStatus;
}

/* ── Homepage Video ── */

export interface HeroVideo {
  id: string;
  label: Bilingual;          // admin-friendly label
  mobile: {
    webm: string;
    mp4: string;
    poster: string;          // fallback image
  };
  desktop: {
    webm: string;
    mp4: string;
    poster: string;
  };
  version: string;           // cache-busting version string
  active: boolean;           // which video set is currently live
}
