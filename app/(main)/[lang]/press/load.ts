// app/(main)/[lang]/press/load.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Lang, PressItem } from "./pressTypes";

type Frontmatter = {
  kind: "award" | "mention";
  id: string;

  // YAML may coerce this to a Date object unless quoted
  publishedAt: unknown;

  issuer: string;
  for: "olivea" | "hotel" | "restaurant" | "cafe";
  title: string;
  section?: string;
  tags?: string[];
  links: { label: string; href: string }[];

  // ✅ NEW: optional pinned flag (for awards)
  starred?: boolean;

  // ✅ optional thumbnail for mentions
  cover?: unknown; // expect { src: string; alt?: string }
};

function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) throw new Error(msg);
}

function isValidHref(href: unknown): href is string {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}

function normalizeBody(body: string): string {
  return body.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * ✅ Accepts:
 * - "2025-12-18" (string)
 * - Date object (YAML coercion) -> normalized to YYYY-MM-DD
 */
function normalizePublishedAt(v: unknown): string | null {
  if (v instanceof Date && Number.isFinite(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const t = Date.parse(s + "T00:00:00Z");
    if (!Number.isFinite(t)) return null;
    return s;
  }
  return null;
}

function normalizeCover(v: unknown): PressItem["cover"] {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const src = typeof o.src === "string" ? o.src.trim() : "";
  if (!src || !src.startsWith("/")) return undefined; // must be site-local path
  const alt = typeof o.alt === "string" ? o.alt.trim() : undefined;
  return { src, alt };
}

export function loadPressItems(lang: Lang): PressItem[] {
  const dir = path.join(
    process.cwd(),
    "app",
    "(main)",
    "[lang]",
    "press",
    "content",
    lang
  );
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const items: PressItem[] = [];

  for (const file of files) {
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, "utf8");
    const parsed = matter(raw);

    const fm = parsed.data as Partial<Frontmatter>;
    const blurb = normalizeBody(parsed.content);

    assert(fm.kind === "award" || fm.kind === "mention", `Invalid kind in ${file}`);
    assert(typeof fm.id === "string" && fm.id.length > 0, `Missing id in ${file}`);

    const publishedAt = normalizePublishedAt(fm.publishedAt);
    assert(publishedAt, `Missing/invalid publishedAt (YYYY-MM-DD) in ${file}`);

    assert(typeof fm.issuer === "string" && fm.issuer.length > 0, `Missing issuer in ${file}`);
    assert(
      fm.for === "olivea" || fm.for === "hotel" || fm.for === "restaurant" || fm.for === "cafe",
      `Missing/invalid "for" in ${file}`
    );
    assert(typeof fm.title === "string" && fm.title.length > 0, `Missing title in ${file}`);
    assert(Array.isArray(fm.links) && fm.links.length > 0, `Missing links[] in ${file}`);

    const links = fm.links.map((l, idx) => {
      assert(
        typeof l?.label === "string" && l.label.length > 0,
        `Invalid links[${idx}].label in ${file}`
      );
      assert(isValidHref(l?.href), `Invalid links[${idx}].href in ${file} (must be http/https)`);
      return { label: l.label, href: l.href };
    });

    const tags = Array.isArray(fm.tags)
      ? fm.tags.filter((t) => typeof t === "string")
      : undefined;

    const cover = normalizeCover(fm.cover);

    // ✅ NEW: normalize starred to a strict boolean
    const starred = fm.kind === "award" && fm.starred === true;

    items.push({
      kind: fm.kind,
      id: fm.id,
      publishedAt,
      issuer: fm.issuer,
      for: fm.for,
      title: fm.title,
      section: typeof fm.section === "string" && fm.section.trim() ? fm.section.trim() : undefined,
      tags,
      links,
      blurb,
      cover,

      // ✅ pass-through pinned state
      starred,
    });
  }

  // ✅ sort newest-first by publishedAt
  items.sort((a, b) => {
    const ta = Date.parse(a.publishedAt + "T00:00:00Z");
    const tb = Date.parse(b.publishedAt + "T00:00:00Z");
    return tb - ta || a.title.localeCompare(b.title);
  });

  return items;
}