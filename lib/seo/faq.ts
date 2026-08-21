// lib/seo/faq.ts
//
// One place to turn CMS FAQ copy into schema-ready items.
//
// Background: each venue page grew its own FAQ store and the schema drifted
// away from the page — café declared seven questions while showing a different
// fifteen, Farm To Table declared five and showed eleven, and Casa read from a
// `casa_faq` table the page never rendered. Those stores have since been
// merged into sections[faq].items, which is now the only one: the page renders
// it, the markup describes it, and the admin edits it.

import type { FaqItem } from "@/components/seo/FaqJsonLd";

/**
 * A stable identifier for one stored FAQ entry.
 *
 * The admin editors used to address entries by array position, which is only
 * correct while nobody else is editing: if one person removes a question while
 * another has the list open, the second person's next save lands on whichever
 * question slid into that slot — silently rewriting the wrong answer, with no
 * error and no way to notice. Ids are stored with the item so a reference means
 * the same entry regardless of where it sits.
 */
export function newFaqId(): string {
  const b = crypto.getRandomValues(new Uint8Array(6));
  return "faq_" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/** A bilingual string as the CMS stores it. */
type Bi = { en?: string; es?: string } | undefined;

/** CMS FAQ entry — `sections[faq].items` and `seoFaq` share this shape. */
export interface CmsFaqEntry {
  id?: string;
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
