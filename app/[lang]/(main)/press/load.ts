// app/(main)/[lang]/press/load.ts
import type { Lang, PressItem, PressManifest, PressMediaItem } from "./pressTypes";
import pressFallback from "@/lib/content/data/pressFallback.generated.json";

type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isValidHref(href: unknown): href is string {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}

function normalizeCover(v: unknown): PressItem["cover"] {
  if (!isRecord(v)) return undefined;

  const src = typeof v.src === "string" ? v.src.trim() : "";
  if (!src || !src.startsWith("/")) return undefined;

  const alt = typeof v.alt === "string" ? v.alt.trim() : undefined;
  return { src, alt };
}

/* =========================
   PRESS ITEMS
   =========================
   Primary source: the press_items table in Supabase (managed from
   /admin/press — add/edit/toggle items without a deploy). When the
   table is unreachable or empty, the legacy MDX files below serve
   as the fallback so the page never breaks. */

type PressItemRow = {
  id: string;
  kind: "award" | "mention";
  published_at: string;
  issuer: string;
  target: PressItem["for"];
  title: Record<string, string> | null;
  section: Record<string, string> | null;
  tags: string[] | null;
  links: { label: string | Record<string, string>; href: string }[] | null;
  blurb: Record<string, string> | null;
  cover: { src?: string; alt?: string } | null;
  starred: boolean | null;
};

function pickLang(v: Record<string, string> | null | undefined, lang: Lang): string {
  if (!v) return "";
  return v[lang] || v[lang === "es" ? "en" : "es"] || "";
}

function rowToPressItem(row: PressItemRow, lang: Lang): PressItem | null {
  const title = pickLang(row.title, lang);
  if (!row.id || !title) return null;

  const links = (row.links ?? [])
    .map((l) => ({
      label: typeof l.label === "string" ? l.label : pickLang(l.label, lang),
      href: l.href,
    }))
    .filter((l) => l.label && isValidHref(l.href));
  if (links.length === 0) return null;

  const section = pickLang(row.section, lang);
  const cover = normalizeCover(row.cover ?? undefined);

  return {
    kind: row.kind,
    id: row.id,
    publishedAt: String(row.published_at).slice(0, 10),
    issuer: row.issuer,
    for: row.target,
    title,
    section: section || undefined,
    tags: Array.isArray(row.tags) && row.tags.length > 0 ? row.tags : undefined,
    links,
    blurb: pickLang(row.blurb, lang),
    cover,
    starred: row.kind === "award" && row.starred === true,
  };
}

export async function loadPressItems(lang: Lang): Promise<PressItem[]> {
  // ── Primary: Supabase (RLS exposes only enabled rows to anon) ──
  // Same gate the content provider uses: when Supabase env is absent
  // (e.g. the secret-free CI build), skip straight to the MDX fallback —
  // an anon fetch against an empty base URL hangs the prerender.
  try {
    const { isSupabaseConfigured } = await import("@/lib/supabase/config");
    if (!isSupabaseConfigured) return loadPressItemsFromMdx(lang);
    const { selectRows } = await import("@/lib/supabase/client");
    const rows = await selectRows<PressItemRow>("press_items", {
      role: "anon",
      query: "order=published_at.desc",
      revalidate: 60,
    });
    const items = rows
      .map((r) => rowToPressItem(r, lang))
      .filter((x): x is PressItem => x !== null);
    if (items.length > 0) {
      items.sort((a, b) => {
        const ta = Date.parse(a.publishedAt + "T00:00:00Z");
        const tb = Date.parse(b.publishedAt + "T00:00:00Z");
        return tb - ta || a.title.localeCompare(b.title);
      });
      return items;
    }
  } catch {
    // Supabase unavailable — fall through to the MDX files.
  }

  return loadPressItemsFromMdx(lang);
}

/* Generated MDX fallback — refreshed by predev/prebuild/postinstall. */
export function loadPressItemsFromMdx(lang: Lang): PressItem[] {
  return pressFallback.items[lang].map((item) => ({
    ...item,
    links: item.links.map((link) => ({ ...link })),
  })) as PressItem[];
}

/* =========================
   PRESS MANIFEST (JSON)
   ========================= */

const DEFAULT_MANIFEST: PressManifest = {
  version: "0",
  updatedAt: "1970-01-01",
  contactEmail: "pr@casaolivea.com",
  downloads: {
    fullKit: "/press/Olivea-PressKit.zip",
    logos: "/press/Olivea-Logos.zip",
    photos: "/press/Olivea-Photos.zip",
    factsheet: "/press/Olivea-FactSheet.pdf",
  },
  copy: {
    es: {
      headline: "Sala de Prensa",
      subhead: "Recursos oficiales listos para publicar.",
      usageTitle: "Uso editorial",
      usageBody: "Material disponible para uso editorial. Para usos comerciales, contáctanos.",
      boilerplate30: "Olivea es un ecosistema gastronómico y de hospitalidad arraigado al huerto.",
      boilerplate80: "Olivea integra restaurante, hotel y café en una experiencia conectada al huerto.",
    },
    en: {
      headline: "Press Room",
      subhead: "Official, publish-ready materials.",
      usageTitle: "Editorial use",
      usageBody: "Assets provided for editorial coverage. For commercial usage, please contact us.",
      boilerplate30: "Olivea is a garden-rooted hospitality and culinary ecosystem.",
      boilerplate80: "Olivea integrates restaurant, hotel, and café into one connected experience.",
    },
  },
  media: [],
};

function isSitePath(p: unknown): p is string {
  return typeof p === "string" && p.startsWith("/") && p.length > 1;
}

function normalizeMediaItem(x: unknown): PressMediaItem | null {
  if (!isRecord(x)) return null;

  const id = typeof x.id === "string" ? x.id.trim() : "";
  const category = typeof x.category === "string" ? x.category : "other";

  const titleObj = isRecord(x.title) ? x.title : null;
  const titleEs = titleObj && typeof titleObj.es === "string" ? titleObj.es : "";
  const titleEn = titleObj && typeof titleObj.en === "string" ? titleObj.en : "";

  const web = isSitePath(x.web) ? x.web : "";
  const hires = isSitePath(x.hires) ? x.hires : undefined;

  const credit = typeof x.credit === "string" ? x.credit : undefined;

  const captionObj = isRecord(x.caption) ? x.caption : undefined;
  const captionEs =
    captionObj && typeof captionObj.es === "string" ? captionObj.es : undefined;
  const captionEn =
    captionObj && typeof captionObj.en === "string" ? captionObj.en : undefined;

  if (!id || !web) return null;

  return {
    id,
    category: category as PressMediaItem["category"],
    title: { es: titleEs, en: titleEn },
    web,
    hires,
    credit,
    caption:
      captionEs || captionEn
        ? { es: captionEs ?? "", en: captionEn ?? "" }
        : undefined,
  };
}

function normalizeManifest(maybe: unknown): PressManifest {
  if (!isRecord(maybe)) return DEFAULT_MANIFEST;

  const version =
    typeof maybe.version === "string" && maybe.version.trim()
      ? maybe.version.trim()
      : DEFAULT_MANIFEST.version;

  const updatedAt =
    typeof maybe.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(maybe.updatedAt.trim())
      ? maybe.updatedAt.trim()
      : DEFAULT_MANIFEST.updatedAt;

  const contactEmail =
    typeof maybe.contactEmail === "string" && maybe.contactEmail.includes("@")
      ? maybe.contactEmail.trim()
      : DEFAULT_MANIFEST.contactEmail;

  const downloadsObj = isRecord(maybe.downloads) ? maybe.downloads : {};
  const downloads: PressManifest["downloads"] = {
    fullKit: isSitePath(downloadsObj.fullKit) ? downloadsObj.fullKit : DEFAULT_MANIFEST.downloads.fullKit,
    logos: isSitePath(downloadsObj.logos) ? downloadsObj.logos : DEFAULT_MANIFEST.downloads.logos,
    photos: isSitePath(downloadsObj.photos) ? downloadsObj.photos : DEFAULT_MANIFEST.downloads.photos,
    factsheet: isSitePath(downloadsObj.factsheet) ? downloadsObj.factsheet : DEFAULT_MANIFEST.downloads.factsheet,
  };

  const copyObj = isRecord(maybe.copy) ? maybe.copy : {};
  const esObj = isRecord(copyObj.es) ? copyObj.es : {};
  const enObj = isRecord(copyObj.en) ? copyObj.en : {};

  const copy: PressManifest["copy"] = {
    es: { ...DEFAULT_MANIFEST.copy.es, ...esObj },
    en: { ...DEFAULT_MANIFEST.copy.en, ...enObj },
  };

  const mediaArr = Array.isArray(maybe.media) ? maybe.media : [];
  const media: PressMediaItem[] = [];
  for (const entry of mediaArr) {
    const norm = normalizeMediaItem(entry);
    if (norm) media.push(norm);
  }

  return { version, updatedAt, contactEmail, downloads, copy, media };
}

export function loadPressManifest(): PressManifest {
  return normalizeManifest(pressFallback.manifest);
}
