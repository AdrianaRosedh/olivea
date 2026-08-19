// app/(main)/[lang]/sustainability/load.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { listContent } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Lang, PhilosophySection, PhilosophySectionId } from "./philosophyTypes";

type Frontmatter = {
  id: PhilosophySectionId;
  order: number;
  title: string;
  subtitle?: string;
  signals?: string[];
  practices?: string[];
};

function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) throw new Error(msg);
}

function normalizeBody(body: string): string {
  return body.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

export function loadPhilosophySections(lang: Lang): PhilosophySection[] {
  const dir = path.join(
    process.cwd(),
    "app",
    "(main)",
    "[lang]",
    "sustainability",
    "content",
    lang
  );

  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const out: PhilosophySection[] = [];

  for (const file of files) {
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, "utf8");
    const parsed = matter(raw);

    const fm = parsed.data as Partial<Frontmatter>;
    const body = normalizeBody(parsed.content);

    assert(typeof fm.id === "string", `Missing id in ${file}`);
    assert(typeof fm.order === "number", `Missing order in ${file}`);
    assert(typeof fm.title === "string" && fm.title.length > 0, `Missing title in ${file}`);

    out.push({
      id: fm.id as PhilosophySectionId,
      order: fm.order,
      title: fm.title,
      subtitle: typeof fm.subtitle === "string" ? fm.subtitle : undefined,
      signals: Array.isArray(fm.signals) ? fm.signals.filter((x) => typeof x === "string") : undefined,
      practices: Array.isArray(fm.practices) ? fm.practices.filter((x) => typeof x === "string") : undefined,
      body,
    });
  }

  out.sort((a, b) => a.order - b.order);
  return out;
}

/* ── CMS overlay (Supabase sustainability_sections) ──────────────────
   The admin editor stores bilingual sections with HTML bodies, while
   PhilosophyClient renders plain-prose paragraphs split on blank lines.
   Strategy: static MDX is the base (never regresses), and any section
   the CMS knows about overrides per-field. HTML bodies are flattened to
   the same plain-paragraph shape the static loader produces. */

function htmlToPlainParagraphs(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ") // intra-paragraph breaks collapse, same as MDX soft breaks
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([^\n])\n(?!\n)/g, "$1 ") // soft breaks → spaces, keep \n\n
    .replace(/[ \t]+/g, " ")
    .trim();
}

export async function loadPhilosophySectionsCms(
  lang: Lang
): Promise<PhilosophySection[]> {
  const base = loadPhilosophySections(lang);
  if (!isSupabaseConfigured) return base;

  try {
    const cms = await listContent("sustainabilitySections");
    if (!cms?.length) return base;

    const byId = new Map(cms.map((s) => [s.id, s]));
    return base.map((section) => {
      const row = byId.get(section.id);
      if (!row) return section;

      const title = row.title?.[lang]?.trim();
      const subtitle = row.subtitle?.[lang]?.trim();
      const body = htmlToPlainParagraphs(row.body?.[lang] ?? "");
      const signals = row.signals
        ?.map((b) => b?.[lang]?.trim())
        .filter((s): s is string => !!s);
      const practices = row.practices
        ?.map((b) => b?.[lang]?.trim())
        .filter((s): s is string => !!s);

      return {
        ...section,
        title: title || section.title,
        subtitle: subtitle || section.subtitle,
        body: body || section.body,
        signals: signals?.length ? signals : section.signals,
        practices: practices?.length ? practices : section.practices,
      };
    });
  } catch {
    return base; // CMS unavailable → static content, never a broken page
  }
}