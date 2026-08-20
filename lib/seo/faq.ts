// lib/seo/faq.ts
//
// One place to turn CMS FAQ copy into schema-ready items.
//
// Background: each venue page grew its own FAQ store, and the schema drifted
// away from the page. Café declared seven questions in JSON-LD while showing a
// different fifteen; Farm To Table declared five and showed eleven; Casa read
// from a `casa_faq` table while the page rendered `sections[faq].items`. Across
// the three, none of the declared questions appeared on the page they described
// and none of the 32 written, visible answers were machine-readable at all.
//
// That is the worst of both: search engines discount FAQ markup that does not
// match the page, and the real answers stay invisible to assistants. Emitting
// from what the page actually shows fixes both halves at once.

import type { FaqItem } from "@/components/seo/FaqJsonLd";

/** A bilingual string as the CMS stores it. */
type Bi = { en?: string; es?: string } | undefined;

/** CMS FAQ entry — `sections[faq].items` and `seoFaq` share this shape. */
export interface CmsFaqEntry {
  q?: Bi;
  a?: Bi;
  question?: Bi;
  answer?: Bi;
}

function pick(v: Bi, lang: "en" | "es"): string {
  if (!v) return "";
  return (lang === "en" ? v.en || v.es : v.es || v.en) || "";
}

/**
 * Answers are authored with light markdown for the visible page. schema.org
 * wants readable text, so the emphasis markers come out — leaving them in
 * means an assistant quotes "a **seasonal tasting menu**" with the asterisks.
 */
export function stripMarkdown(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalise CMS entries into the flat {q,a} the JSON-LD component wants. */
export function toFaqItems(
  entries: CmsFaqEntry[] | undefined,
  lang: "en" | "es"
): FaqItem[] {
  if (!entries?.length) return [];
  return entries
    .map((e) => ({
      q: stripMarkdown(pick(e.q ?? e.question, lang)),
      a: stripMarkdown(pick(e.a ?? e.answer, lang)),
    }))
    .filter((x) => x.q && x.a);
}

/**
 * Merge the page's visible FAQ with extra questions that exist only for search.
 *
 * Visible items come first and win on collision: if the same question is
 * worded two ways, the one a human can actually read on the page is the one
 * that should be quoted back to them. The extras are rendered into the
 * server-side article so the markup still describes text present in the HTML.
 */
export function mergeFaq(visible: FaqItem[], extra: FaqItem[]): FaqItem[] {
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const seen = new Set(visible.map((x) => key(x.q)));
  return [...visible, ...extra.filter((x) => !seen.has(key(x.q)))];
}

/** Pull the `faq` section out of a page's CMS `sections` array. */
export function faqSectionOf(
  sections: unknown
): { items?: CmsFaqEntry[]; seoFaq?: CmsFaqEntry[] } | undefined {
  if (!Array.isArray(sections)) return undefined;
  return sections.find(
    (s): s is { id: string; items?: CmsFaqEntry[]; seoFaq?: CmsFaqEntry[] } =>
      typeof s === "object" && s !== null && (s as { id?: string }).id === "faq"
  );
}
