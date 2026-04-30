// lib/content/provider.ts
// ─────────────────────────────────────────────────────────────────────
// Content Provider — the abstraction layer between pages and data.
//
// Phase 1 (now):   Returns static data from ./data/ files
// Phase 2 (later): Swaps to Supabase queries — same interface, different source
//
// Usage in pages:
//   import { getContent } from "@/lib/content";
//   const home = await getContent("home");
// ─────────────────────────────────────────────────────────────────────

import type {
  HomeContent,
  FarmToTableContent,
  CasaContent,
  CafeContent,
  ContactContent,
  SustainabilityContent,
  PressContent,
  CareersContent,
  LegalContent,
  TeamContent,
  NotFoundContent,
  JournalPost,
  JournalArticle,
  GlobalSettings,
  DrawerContent,
  FooterContent,
  FaqItem,
  MediaItem,
  Promotion,
  BusinessHours,
  PopupItem,
  BannerItem,
  PressItemFull,
  SustainabilitySection,
  HeroVideo,
} from "./types";

// ── Content Map — maps content keys to their return types ──

export interface ContentMap {
  home: HomeContent;
  farmtotable: FarmToTableContent;
  casa: CasaContent;
  cafe: CafeContent;
  contact: ContactContent;
  sustainability: SustainabilityContent;
  press: PressContent;
  careers: CareersContent;
  legal: LegalContent;
  team: TeamContent;
  notFound: NotFoundContent;
  global: GlobalSettings;
  drawer: DrawerContent;
  footer: FooterContent;
}

export type ContentKey = keyof ContentMap;

// ── Collection Map — maps collection keys to their item types ──

export interface CollectionMap {
  journal: JournalPost;
  journalArticles: JournalArticle;
  faq: FaqItem;
  media: MediaItem;
  promotions: Promotion;
  hours: BusinessHours;
  popups: PopupItem;
  banners: BannerItem;
  pressItems: PressItemFull;
  sustainabilitySections: SustainabilitySection;
  heroVideos: HeroVideo;
}

export type CollectionKey = keyof CollectionMap;

// ── Source interface (what we swap between static → Supabase) ──

export interface ContentSource {
  get<K extends ContentKey>(key: K): Promise<ContentMap[K]>;
  list<K extends CollectionKey>(
    key: K,
    opts?: { filter?: Partial<CollectionMap[K]>; limit?: number }
  ): Promise<CollectionMap[K][]>;
  getById<K extends CollectionKey>(
    key: K,
    id: string
  ): Promise<CollectionMap[K] | null>;
}

// ── Static source (Phase 1) ──

class StaticContentSource implements ContentSource {
  async get<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
    // Dynamic import to keep bundles lean — each data file is its own chunk
    const mod = await import(`./data/${key}`);
    return mod.default as ContentMap[K];
  }

  async list<K extends CollectionKey>(
    key: K,
    opts?: { filter?: Partial<CollectionMap[K]>; limit?: number }
  ): Promise<CollectionMap[K][]> {
    const mod = await import(`./data/${key}`);
    let items = (mod.default ?? mod.items ?? []) as CollectionMap[K][];

    if (opts?.filter) {
      items = items.filter((item) =>
        Object.entries(opts.filter!).every(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([k, v]) => (item as any)[k] === v
        )
      );
    }

    if (opts?.limit) {
      items = items.slice(0, opts.limit);
    }

    return items;
  }

  async getById<K extends CollectionKey>(
    key: K,
    id: string
  ): Promise<CollectionMap[K] | null> {
    const items = await this.list(key);
    return (
      (items.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.id === id
      ) as CollectionMap[K]) ?? null
    );
  }
}

// ── Supabase source (Phase 2) ──
// Reads from Supabase when env vars are configured. Falls back to static
// data if a table is empty or a query fails, so the site never breaks.

class SupabaseContentSource implements ContentSource {
  private static: StaticContentSource;

  constructor() {
    this.static = new StaticContentSource();
  }

  /** Map content keys to Supabase table names (single-row config tables) */
  private contentTableMap: Partial<Record<ContentKey, string>> = {
    home: "home_content",
    farmtotable: "farmtotable_content",
    casa: "casa_content",
    cafe: "cafe_content",
    contact: "contact_content",
    sustainability: "sustainability_content",
    press: "press_content",
    careers: "careers_content",
    legal: "legal_content",
    team: "team_content",
    notFound: "not_found_content",
    global: "global_settings",
    drawer: "drawer_content",
    footer: "footer_content",
  };

  /** Map collection keys to Supabase table names */
  private collectionTableMap: Partial<Record<CollectionKey, string>> = {
    popups: "popups",
    banners: "banners",
    heroVideos: "hero_videos",
    sustainabilitySections: "sustainability_sections",
  };

  /** Map for collections stored as nested data in content tables */
  private nestedCollectionMap: Partial<Record<CollectionKey, { table: string; field?: string }>> = {
    faq: { table: "casa_faq" },
  };

  async get<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
    const table = this.contentTableMap[key];
    if (!table) {
      // No Supabase table for this key — fall back to static
      return this.static.get(key);
    }

    try {
      const { selectRows } = await import("@/lib/supabase/client");
      const rows = await selectRows(table, { role: "anon", query: "limit=1", revalidate: 60 });
      if (rows.length === 0) return this.static.get(key);

      const row = rows[0] as Record<string, unknown>;

      // Tables with snake_case → camelCase mapping
      const mapper = this.contentMappers[key];
      if (mapper) {
        return mapper(row) as ContentMap[K];
      }

      // Tables where JSONB columns match TypeScript shape directly.
      // Merge with static defaults so missing columns (e.g. faq not in
      // casa_content) are filled from the data file rather than undefined.
      const staticDefault = await this.static.get(key);
      const { id: _id, updated_at: _u, ...cleanRow } = row;
      return { ...staticDefault, ...cleanRow } as ContentMap[K];
    } catch {
      // Supabase unavailable — silent fallback to static
      return this.static.get(key);
    }
  }

  async list<K extends CollectionKey>(
    key: K,
    opts?: { filter?: Partial<CollectionMap[K]>; limit?: number }
  ): Promise<CollectionMap[K][]> {
    const table = this.collectionTableMap[key];
    const nested = this.nestedCollectionMap[key];

    if (!table && !nested) {
      return this.static.list(key, opts);
    }

    try {
      const { selectRows } = await import("@/lib/supabase/client");

      if (nested) {
        // Direct table query (e.g. casa_faq)
        const queryParts: string[] = [];
        if (key === "faq") queryParts.push("order=sort_order.asc");
        if (opts?.limit) queryParts.push(`limit=${opts.limit}`);
        const rows = await selectRows(nested.table, {
          role: "anon",
          query: queryParts.join("&") || undefined,
          revalidate: 60,
        });

        if (rows.length === 0) return this.static.list(key, opts);

        if (key === "faq") {
          return (rows as unknown as Array<Record<string, unknown>>).map(
            (r) => this.mapFaqRow(r)
          ) as CollectionMap[K][];
        }
        return rows as unknown as CollectionMap[K][];
      }

      if (table) {
        const queryParts: string[] = [];
        if (key === "popups") queryParts.push("order=priority.desc,created_at.desc");
        if (key === "banners") queryParts.push("order=created_at.desc");
        if (key === "heroVideos") queryParts.push("order=created_at.desc");
        if (key === "sustainabilitySections") queryParts.push("order=sort_order.asc");

        // Apply simple filters
        if (opts?.filter) {
          for (const [k, v] of Object.entries(opts.filter)) {
            if (v !== undefined) queryParts.push(`${k}=eq.${v}`);
          }
        }
        if (opts?.limit) queryParts.push(`limit=${opts.limit}`);

        const rows = await selectRows(table, {
          role: "anon",
          query: queryParts.join("&") || undefined,
          revalidate: 60,
        });

        if (rows.length === 0) return this.static.list(key, opts);

        if (key === "popups") {
          return (rows as unknown as Array<Record<string, unknown>>).map(
            (r) => this.mapPopupRow(r)
          ) as CollectionMap[K][];
        }
        if (key === "banners") {
          return (rows as unknown as Array<Record<string, unknown>>).map(
            (r) => this.mapBannerRow(r)
          ) as CollectionMap[K][];
        }
        if (key === "heroVideos") {
          return (rows as unknown as Array<Record<string, unknown>>).map(
            (r) => this.mapHeroVideoRow(r)
          ) as CollectionMap[K][];
        }
        if (key === "sustainabilitySections") {
          return (rows as unknown as Array<Record<string, unknown>>).map(
            (r) => this.mapSustainabilitySectionRow(r)
          ) as CollectionMap[K][];
        }

        return rows as unknown as CollectionMap[K][];
      }

      return this.static.list(key, opts);
    } catch {
      return this.static.list(key, opts);
    }
  }

  async getById<K extends CollectionKey>(
    key: K,
    id: string
  ): Promise<CollectionMap[K] | null> {
    const table = this.collectionTableMap[key] ?? this.nestedCollectionMap[key]?.table;
    if (!table) return this.static.getById(key, id);

    try {
      const { selectOne } = await import("@/lib/supabase/client");
      const row = await selectOne(table, id, { role: "anon", revalidate: 60 });
      if (!row) return this.static.getById(key, id);
      return row as unknown as CollectionMap[K];
    } catch {
      return this.static.getById(key, id);
    }
  }

  // ── Content mappers (for tables with snake_case → camelCase) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private contentMappers: Partial<Record<ContentKey, (r: Record<string, unknown>) => any>> = {
    home: (r) => this.mapHomeRow(r),
    careers: (r) => this.mapCareersRow(r),
    contact: (r) => this.mapContactRow(r),
    global: (r) => this.mapGlobalRow(r),
    drawer: (r) => this.mapDrawerRow(r),
    notFound: (r) => ({
      meta: r.meta,
      message: r.message,
      cta: r.cta,
    }),
  };

  // ── Row mappers (Supabase snake_case → TypeScript camelCase) ──

  private mapPopupRow(r: Record<string, unknown>): PopupItem {
    return {
      id: r.id as string,
      enabled: r.enabled as boolean,
      kind: r.kind as "journal" | "announcement",
      priority: (r.priority as number) ?? 100,
      translations: r.translations as PopupItem["translations"],
      media: r.media as PopupItem["media"],
      rules: r.rules as PopupItem["rules"],
    };
  }

  private mapBannerRow(r: Record<string, unknown>): BannerItem {
    return {
      id: r.id as string,
      enabled: r.enabled as boolean,
      type: r.type as "notice" | "promo" | "warning",
      translations: r.translations as BannerItem["translations"],
      startsAt: r.starts_at as string | undefined,
      endsAt: r.ends_at as string | undefined,
      dismissible: (r.dismissible as boolean) ?? true,
      includePaths: (r.include_paths as string[]) ?? [],
      excludePaths: (r.exclude_paths as string[]) ?? [],
    };
  }

  private mapFaqRow(r: Record<string, unknown>): FaqItem {
    return {
      id: r.id as string,
      page: r.page as string,
      question: r.question as FaqItem["question"],
      answer: r.answer as FaqItem["answer"],
      sortOrder: (r.sort_order as number) ?? 0,
    };
  }

  private mapHeroVideoRow(r: Record<string, unknown>): HeroVideo {
    return {
      id: r.id as string,
      label: r.label as HeroVideo["label"],
      mobile: r.mobile as HeroVideo["mobile"],
      desktop: r.desktop as HeroVideo["desktop"],
      version: r.version as string,
      active: r.active as boolean,
    };
  }

  private mapCareersRow(r: Record<string, unknown>): CareersContent {
    return {
      meta: r.meta as CareersContent["meta"],
      hero: r.hero as CareersContent["hero"],
      standards: r.standards as CareersContent["standards"],
      hiringSteps: r.hiring_steps as CareersContent["hiringSteps"],
      principles: r.principles as CareersContent["principles"],
      tracks: r.tracks as CareersContent["tracks"],
      openings: r.openings as CareersContent["openings"],
      application: r.application as CareersContent["application"],
    };
  }

  private mapHomeRow(r: Record<string, unknown>): HomeContent {
    // Supabase stores meta + hero; video comes from hero_videos table.
    // We return partial data — the homepage loads video via listContent().
    return {
      meta: (r.meta ?? {}) as HomeContent["meta"],
      hero: (r.hero ?? {}) as HomeContent["hero"],
      // Video loaded separately from hero_videos collection
      video: undefined as unknown as HomeContent["video"],
    };
  }

  private mapContactRow(r: Record<string, unknown>): ContactContent {
    return {
      meta: r.meta as ContactContent["meta"],
      kicker: r.kicker as ContactContent["kicker"],
      subtitle: r.subtitle as ContactContent["subtitle"],
      actions: r.actions as ContactContent["actions"],
      labels: r.labels as ContactContent["labels"],
      sections: r.sections as ContactContent["sections"],
      footerNote: r.footer_note as ContactContent["footerNote"],
      map: r.map as ContactContent["map"],
    };
  }

  private mapGlobalRow(r: Record<string, unknown>): GlobalSettings {
    return {
      siteName: r.site_name as string,
      tagline: r.tagline as GlobalSettings["tagline"],
      defaultLocale: r.default_locale as "es" | "en",
      contactInfo: r.contact_info as GlobalSettings["contactInfo"],
      hours: r.hours as GlobalSettings["hours"],
      socials: r.socials as GlobalSettings["socials"],
      defaultOgImage: r.default_og_image as string,
      twitterHandle: r.twitter_handle as string,
    };
  }

  private mapDrawerRow(r: Record<string, unknown>): DrawerContent {
    return {
      mainLinks: r.main_links as DrawerContent["mainLinks"],
      moreLinks: r.more_links as DrawerContent["moreLinks"],
      copyright: r.copyright as DrawerContent["copyright"],
      seeMore: r.see_more as DrawerContent["seeMore"],
      hide: r.hide as DrawerContent["hide"],
    };
  }

  private mapSustainabilitySectionRow(r: Record<string, unknown>): SustainabilitySection {
    return {
      id: r.id as string,
      order: (r.sort_order as number) ?? 0,
      title: r.title as SustainabilitySection["title"],
      subtitle: r.subtitle as SustainabilitySection["subtitle"],
      signals: r.signals as SustainabilitySection["signals"],
      practices: r.practices as SustainabilitySection["practices"],
      body: r.body as SustainabilitySection["body"],
    };
  }
}

// ── Singleton instance ──
// Auto-detects Supabase config and swaps source accordingly.

let _source: ContentSource | null = null;

function getSource(): ContentSource {
  if (!_source) {
    // Check if Supabase is configured at runtime
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url.length > 0 && key.length > 0) {
      _source = new SupabaseContentSource();
    } else {
      _source = new StaticContentSource();
    }
  }
  return _source;
}

/** Override the content source (useful for testing or Supabase migration) */
export function setContentSource(source: ContentSource) {
  _source = source;
}

// ── Public API ──

/**
 * Get a structured content block by key.
 *
 * @example
 *   const home = await getContent("home");
 *   const title = home.hero.title.en;
 */
export async function getContent<K extends ContentKey>(
  key: K
): Promise<ContentMap[K]> {
  return getSource().get(key);
}

/**
 * List items in a collection with optional filtering.
 *
 * @example
 *   const published = await listContent("journal", { filter: { status: "published" } });
 *   const popups = await listContent("popups", { filter: { enabled: true } });
 */
export async function listContent<K extends CollectionKey>(
  key: K,
  opts?: { filter?: Partial<CollectionMap[K]>; limit?: number }
): Promise<CollectionMap[K][]> {
  return getSource().list(key, opts);
}

/**
 * Get a single collection item by ID.
 *
 * @example
 *   const post = await getContentById("journal", "post-id");
 */
export async function getContentById<K extends CollectionKey>(
  key: K,
  id: string
): Promise<CollectionMap[K] | null> {
  return getSource().getById(key, id);
}
