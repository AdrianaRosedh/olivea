// lib/journal/load.ts
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

export async function listJournalSlugs(lang: JournalLang): Promise<string[]> {
  const dir = langDir(lang);
  const files = await safeReaddir(dir);

  return files
    .filter(isMdxFile)
    .filter((f) => !isCopyFile(f))
    .map((f) => f.replace(/\.mdx$/i, ""));
}

export async function loadJournalBySlug(
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
      // Consistent not-found behavior (page will call notFound())
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

export async function listJournalIndex(
  lang: JournalLang
): Promise<JournalIndexItem[]> {
  const fileSlugs = await listJournalSlugs(lang);

  const items = await Promise.all(
    fileSlugs.map(async (fileSlug) => {
      const p = await loadJournalBySlug(lang, fileSlug);
      return { ...p.fm, readingMinutes: p.readingMinutes };
    })
  );

  items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return items;
}

export async function findTranslationSlug(
  translationId: string,
  targetLang: JournalLang
): Promise<string | null> {
  const fileSlugs = await listJournalSlugs(targetLang);

  for (const fileSlug of fileSlugs) {
    const p = await loadJournalBySlug(targetLang, fileSlug);
    if (p.fm.translationId === translationId) return fileSlug;
  }

  return null;
}