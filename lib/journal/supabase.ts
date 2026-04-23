// lib/journal/supabase.ts
// ─────────────────────────────────────────────────────────────────────
// Public-facing journal data from Supabase — NO auth required.
// Uses anon key with RLS policies that allow SELECT on published posts.
// Falls back gracefully if Supabase is not configured.
// ─────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { selectRows } from "@/lib/supabase/client";
import type { JournalLang } from "./schema";

/* ── Row type matching journal_posts table ── */

interface JournalRow {
  id: string;
  title_es: string;
  title_en: string;
  slug: string;
  excerpt_es: string;
  excerpt_en: string;
  body_es: string;
  body_en: string;
  cover_image: string | null;
  cover_alt: string | null;
  author: string;
  authors: { id?: string; name: string }[] | null;
  gallery: { src: string; alt: string }[] | null;
  status: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/* ── Public journal index item (for listing pages) ── */

export interface SupabaseJournalItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
}

/* ── Full journal post (for detail pages) ── */

export interface SupabaseJournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;           // HTML string
  coverImage?: string;
  coverAlt?: string;
  author: string;
  authors?: { id?: string; name: string }[];
  gallery?: { src: string; alt: string }[];
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  // For translation linking — we use the same slug pattern
  titleEs: string;
  titleEn: string;
  slugOther?: string;     // not stored, resolved at query time
}

/* ── Helpers ── */

function langField(lang: JournalLang, field: "title" | "excerpt" | "body"): keyof JournalRow {
  return `${field}_${lang}` as keyof JournalRow;
}

function estimateReadingMinutes(html: string): number {
  // Strip HTML tags and count words
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/* ── Public queries (anon role, no auth) ── */

/**
 * List all published journal posts for the given language.
 * Returns items sorted by published_at desc.
 */
export async function listPublishedJournalPosts(
  lang: JournalLang,
): Promise<(SupabaseJournalItem & { readingMinutes: number })[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const rows = await selectRows<JournalRow>("journal_posts", {
      role: "anon",
      query: `select=id,slug,title_es,title_en,excerpt_es,excerpt_en,body_${lang},cover_image,author,tags,published_at,updated_at&status=eq.published&order=published_at.desc`,
      revalidate: 60, // ISR: revalidate every 60s, compatible with static generation
    });

    return rows
      .filter((r) => r.published_at) // safety check
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        title: (r[langField(lang, "title")] as string) || r.title_es || "Untitled",
        excerpt: (r[langField(lang, "excerpt")] as string) || r.excerpt_es || "",
        coverImage: r.cover_image ?? undefined,
        author: r.author || "Olivea",
        tags: r.tags ?? [],
        publishedAt: r.published_at!,
        updatedAt: r.updated_at,
        readingMinutes: estimateReadingMinutes(
          (r[`body_${lang}` as keyof JournalRow] as string) || "",
        ),
      }));
  } catch (e) {
    console.error("[journal/supabase] Failed to list published posts:", e);
    return [];
  }
}

/**
 * Load a single published journal post by slug for the given language.
 * Returns null if not found or not published.
 */
export async function loadPublishedJournalPost(
  lang: JournalLang,
  slug: string,
): Promise<(SupabaseJournalPost & { readingMinutes: number }) | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const rows = await selectRows<JournalRow>("journal_posts", {
      role: "anon",
      query: `slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
      revalidate: 60,
    });

    if (rows.length === 0) return null;

    const r = rows[0];
    const body = (r[langField(lang, "body")] as string) || "";

    return {
      id: r.id,
      slug: r.slug,
      title: (r[langField(lang, "title")] as string) || r.title_es || "Untitled",
      excerpt: (r[langField(lang, "excerpt")] as string) || r.excerpt_es || "",
      body,
      coverImage: r.cover_image ?? undefined,
      coverAlt: r.cover_alt ?? undefined,
      author: r.author || "Olivea",
      authors: Array.isArray(r.authors) && r.authors.length > 0 ? r.authors : undefined,
      gallery: Array.isArray(r.gallery) && r.gallery.length > 0 ? r.gallery : undefined,
      tags: r.tags ?? [],
      publishedAt: r.published_at || r.created_at,
      updatedAt: r.updated_at,
      titleEs: r.title_es,
      titleEn: r.title_en,
      readingMinutes: estimateReadingMinutes(body),
    };
  } catch (e) {
    console.error(`[journal/supabase] Failed to load post ${slug}:`, e);
    return null;
  }
}

/**
 * List all published slugs (for generateStaticParams).
 */
export async function listPublishedSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const rows = await selectRows<{ slug: string }>("journal_posts", {
      role: "anon",
      query: "select=slug&status=eq.published",
      revalidate: 60,
    });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}
