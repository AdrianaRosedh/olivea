// app/(main)/[lang]/sustainability/load.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { listContent } from "@/lib/content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Lang, PhilosophySection } from "./philosophyTypes";

type Frontmatter = {
  id: string;
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
  // The route moved from app/(main)/[lang] to app/[lang]/(main) when the root
  // layout was placed under [lang]. This path did not move with it, so the
  // directory stopped existing, the base list came back empty, and the whole
  // philosophy page rendered with no sections — silently, because a missing
  // directory returned [] rather than complaining.
  //
  // The old location is still checked so the page cannot break again on the
  // next move, and an empty result is now loud in development.
  const candidates = [
    path.join(process.cwd(), "app", "[lang]", "(main)", "sustainability", "content", lang),
    path.join(process.cwd(), "app", "(main)", "[lang]", "sustainability", "content", lang),
  ];

  const dir = candidates.find((d) => fs.existsSync(d));

  if (!dir) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[philosophy] No section content found for "${lang}". Looked in:\n  ` +
          candidates.join("\n  ") +
          "\nThe page will render without sections."
      );
    }
    return [];
  }

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
      id: fm.id,
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

    // The CMS decides which sections exist, in what order.
    //
    // It used to be the other way round: the MDX produced the list and the
    // CMS could only overwrite fields of sections that already existed in a
    // file. That made the admin a skin rather than a source — adding,
    // removing or reordering a chapter there did nothing, and any field the
    // CMS left blank silently fell back to whatever the file said, so the two
    // could disagree with no way to tell which a visitor was reading.
    //
    // MDX is now a seed: it still answers when Supabase is unreachable or has
    // no rows, and it still fills individual blanks for a chapter it shares an
    // id with. But it no longer constrains the list.
    const baseById = new Map(base.map((s) => [s.id, s]));

    const sections = [...cms]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((row, index) => {
        const seed = baseById.get(row.id);

        const title = row.title?.[lang]?.trim() || seed?.title || "";
        const subtitle = row.subtitle?.[lang]?.trim() || seed?.subtitle;
        const body = htmlToPlainParagraphs(row.body?.[lang] ?? "") || seed?.body || "";

        const signals = row.signals
          ?.map((b) => b?.[lang]?.trim())
          .filter((s): s is string => !!s);
        const practices = row.practices
          ?.map((b) => b?.[lang]?.trim())
          .filter((s): s is string => !!s);

        return {
          id: row.id,
          // Renumbered from position so a gap or a duplicate in the CMS
          // ordering cannot reshuffle the page.
          order: index + 1,
          title,
          subtitle,
          body,
          signals: signals?.length ? signals : seed?.signals,
          practices: practices?.length ? practices : seed?.practices,
        } satisfies PhilosophySection;
      })
      // A chapter with no heading and no prose is a half-created row, not
      // content. Rendering it would leave an empty band on the page.
      .filter((s) => s.title.length > 0 && s.body.length > 0);

    // If every row turned out to be empty, fall back rather than publishing a
    // page with no chapters at all.
    return sections.length ? sections : base;
  } catch {
    return base; // CMS unavailable → static content, never a broken page
  }
}