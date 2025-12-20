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

export async function listJournalSlugs(lang: JournalLang): Promise<string[]> {
  const dir = langDir(lang);
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

export async function loadJournalBySlug(
  lang: JournalLang,
  fileSlug: string
): Promise<JournalPost> {
  const filePath = path.join(langDir(lang), `${fileSlug}.mdx`);
  const raw = await fs.readFile(filePath, "utf8");

  const { content, data } = matter(raw);
  const parsed = JournalFrontmatterSchema.safeParse(data);

  if (!parsed.success) {
    console.error(`[journal] Invalid frontmatter for ${lang}/${fileSlug}`, parsed.error.flatten());
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

export async function listJournalIndex(lang: JournalLang): Promise<JournalIndexItem[]> {
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
    if (p.fm.translationId === translationId) return fileSlug; // ✅ return filename slug
  }

  return null;
}
