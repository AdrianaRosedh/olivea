// lib/journal/load.ts
// ─────────────────────────────────────────────────────────────────────
// Journal content loader — tries Supabase first for published posts,
// falls back to MDX files on disk. This allows seamless transition
// from the old file-based system to the new CMS-managed content.
// ─────────────────────────────────────────────────────────────────────
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { compileMDX } from "next-mdx-remote/rsc";

import {
  JournalFrontmatterSchema,
  type JournalFrontmatter,
  type JournalLang,
} from "./schema";
import { mdxComponents } from "@/components/journal/MdxComponents";
import {
  listPublishedJournalPosts,
  loadPublishedJournalPost,
  listPublishedSlugs,
} from "./supabase";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "journal");

function langDir(lang: JournalLang) {
  return path.join(CONTENT_DIR, lang);
}

export type JournalIndexItem = JournalFrontmatter & {
  readingMinutes: number;
};

export type JournalPost = {
  fm: JournalFrontmatter;
  content: React.ReactNode;
  readingMinutes: number;
  /** When content comes from Supabase HTML, this holds the raw HTML */
  htmlBody?: string;
};

function isMdxFile(name: string): boolean {
  return name.toLowerCase().endsWith(".mdx");
}

function isCopyFile(name: string): boolean {
  return /\s+copy(\s+\d+)?\.mdx$/i.test(name);
}

// Remove UTF-8 BOM if present (gray-matter can miss frontmatter otherwise)
function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function normalizeFrontmatterData(data: unknown): Record<string, unknown> {
  const obj: Record<string, unknown> =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  const excerpt = typeof obj.excerpt === "string" ? obj.excerpt.trim() : "";
  const description =
    typeof obj.description === "string" ? obj.description.trim() : "";

  if (!excerpt && description) obj.excerpt = description;
  if (!description && typeof obj.excerpt === "string") {
    obj.description = (obj.excerpt as string).trim();
  }

  return obj;
}

/** ✅ Safe readdir: missing folder => [] (prevents Vercel build failures) */
async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "ENOENT") return [];
    throw e;
  }
}

/* ── MDX file-based loading (original system) ── */

async function listMdxSlugs(lang: JournalLang): Promise<string[]> {
  const dir = langDir(lang);
  const files = await safeReaddir(dir);

  return files
    .filter(isMdxFile)
    .filter((f) => !isCopyFile(f))
    .map((f) => f.replace(/\.mdx$/i, ""));
}

async function loadMdxBySlug(
  lang: JournalLang,
  fileSlug: string
): Promise<JournalPost> {
  const filePath = path.join(langDir(lang), `${fileSlug}.mdx`);

  let raw0: string;
  try {
    raw0 = await fs.readFile(filePath, "utf8");
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "ENOENT") {
      throw new Error(`Journal post not found: ${lang}/${fileSlug}`);
    }
    throw e;
  }

  const raw = stripBom(raw0);
  const { content, data } = matter(raw);

  const hasFrontmatterFence = raw.trimStart().startsWith("---");
  if (!hasFrontmatterFence) {
    console.error(
      `[journal] Missing frontmatter fence (---) at top of file: ${lang}/${fileSlug}`
    );
  }

  const normalized = normalizeFrontmatterData(data);
  const parsed = JournalFrontmatterSchema.safeParse(normalized);

  if (!parsed.success) {
    console.error(
      `[journal] Invalid frontmatter for ${lang}/${fileSlug}`,
      parsed.error.flatten()
    );
    if (Object.keys(normalized).length === 0) {
      console.error(
        `[journal] Frontmatter data is empty for ${lang}/${fileSlug}. Check for BOM, missing --- fences, or malformed YAML.`
      );
    }
    throw new Error(`Invalid journal frontmatter: ${lang}/${fileSlug}`);
  }

  const rt = readingTime(content);

  const compiled = await compileMDX({
    source: content,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return {
    fm: parsed.data,
    content: compiled.content,
    readingMinutes: Math.max(1, Math.round(rt.minutes)),
  };
}

/* ── Public API (Supabase first, MDX fallback) ── */

export async function listJournalSlugs(lang: JournalLang): Promise<string[]> {
  // Get slugs from both sources and merge
  const [supabaseSlugs, mdxSlugs] = await Promise.all([
    listPublishedSlugs(),
    listMdxSlugs(lang),
  ]);

  // Deduplicate — Supabase slugs take precedence
  const seen = new Set(supabaseSlugs);
  for (const s of mdxSlugs) {
    seen.add(s);
  }
  return [...seen];
}

export async function loadJournalBySlug(
  lang: JournalLang,
  fileSlug: string
): Promise<JournalPost> {
  // Try Supabase first
  const supaPost = await loadPublishedJournalPost(lang, fileSlug);

  if (supaPost) {
    // Build a minimal JournalFrontmatter-compatible object
    const fm: JournalFrontmatter = {
      id: supaPost.id,
      lang,
      translationId: supaPost.id, // self-reference if no explicit translation link
      slug: supaPost.slug,
      title: supaPost.title,
      excerpt: supaPost.excerpt,
      publishedAt: supaPost.publishedAt.slice(0, 10), // YYYY-MM-DD
      pillar: "vision", // default pillar for CMS posts
      tags: supaPost.tags,
      cover: supaPost.coverImage
        ? { src: supaPost.coverImage, alt: supaPost.coverAlt || supaPost.title }
        : undefined,
      // Multi-author support: pass through authors array from Supabase
      ...(supaPost.authors?.length
        ? { authors: supaPost.authors }
        : { author: supaPost.author }),
      // Gallery for PhotoCarousel
      ...(supaPost.gallery?.length ? { gallery: supaPost.gallery } : {}),
    };

    return {
      fm,
      content: null, // HTML body will be rendered separately
      readingMinutes: supaPost.readingMinutes,
      htmlBody: supaPost.body,
    };
  }

  // Fall back to MDX
  return loadMdxBySlug(lang, fileSlug);
}

export async function listJournalIndex(
  lang: JournalLang
): Promise<JournalIndexItem[]> {
  // Try Supabase first
  const supabasePosts = await listPublishedJournalPosts(lang);

  // Also get MDX posts
  const mdxSlugs = await listMdxSlugs(lang);

  // Build Supabase items
  const supabaseItems: JournalIndexItem[] = supabasePosts.map((p) => ({
    id: p.id,
    lang,
    translationId: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt.slice(0, 10),
    pillar: "vision" as const,
    tags: p.tags,
    cover: p.coverImage ? { src: p.coverImage, alt: p.title } : undefined,
    author: p.author,
    readingMinutes: p.readingMinutes,
  }));

  // Track which slugs Supabase already covers
  const supabaseSlugsSet = new Set(supabasePosts.map((p) => p.slug));

  // Load MDX items that aren't already in Supabase
  const mdxItems: JournalIndexItem[] = [];
  for (const slug of mdxSlugs) {
    if (supabaseSlugsSet.has(slug)) continue; // Supabase version takes precedence

    try {
      const p = await loadMdxBySlug(lang, slug);
      mdxItems.push({ ...p.fm, readingMinutes: p.readingMinutes });
    } catch (e) {
      console.error(`[journal] Failed to load MDX post ${lang}/${slug}:`, e);
    }
  }

  // Merge and sort
  const all = [...supabaseItems, ...mdxItems];
  all.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return all;
}

export async function findTranslationSlug(
  translationId: string,
  targetLang: JournalLang
): Promise<string | null> {
  // For MDX-based posts, search through files
  const fileSlugs = await listMdxSlugs(targetLang);

  for (const fileSlug of fileSlugs) {
    try {
      const p = await loadMdxBySlug(targetLang, fileSlug);
      if (p.fm.translationId === translationId) return fileSlug;
    } catch {
      continue;
    }
  }

  return null;
}
