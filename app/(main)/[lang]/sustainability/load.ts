// app/(main)/[lang]/sustainability/load.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
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