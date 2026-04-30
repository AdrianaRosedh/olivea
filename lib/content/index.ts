// lib/content/index.ts
// ─────────────────────────────────────────────────────────────────────
// Public barrel — import everything from "@/lib/content"
// ─────────────────────────────────────────────────────────────────────

export { getContent, listContent, getContentById, setContentSource } from "./provider";
export type { ContentKey, CollectionKey, ContentMap, CollectionMap, ContentSource } from "./provider";
export { t, tRich, resolveImage, buildMeta } from "./helpers";

// Re-export all types
export type {
  // Primitives
  Bilingual,
  BilingualRich,
  SiteImage,
  PageMeta,

  // Global / Navigation
  BusinessHours,
  ContactInfo,
  SocialLink,
  GlobalSettings,
  NavItem,
  DrawerContent,
  FooterContent,

  // Page blocks
  HeroBlock,
  HeroCta,
  FaqItem,
  ContentSection,

  // Page content
  HomeContent,
  FarmToTableContent,
  CasaContent,
  CafeContent,
  ContactContent,
  SustainabilityContent,
  PressContent,
  PressArticle,
  CareersContent,
  LegalContent,
  TeamContent,
  TeamMember,
  NotFoundContent,

  // Journal
  JournalPost,
  JournalStatus,
  JournalArticle,
  JournalAuthor,
  JournalArticleSeo,

  // Media & Promotions
  MediaItem,
  Promotion,

  // Popups & Banners
  PopupItem,
  PopupTranslation,
  PopupRules,
  PopupFrequency,
  BannerItem,
  BannerTranslation,
  BannerType,

  // Press / Awards
  PressItemFull,
  PressItemKind,
  PressVenue,
  PressLink,
  PressCover,
  PressMediaItem,
  PressManifest,
  PressRoomCopy,

  // Sustainability sections
  SustainabilitySection,

  // Homepage video
  HeroVideo,
} from "./types";
