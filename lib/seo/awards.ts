// lib/seo/awards.ts
// One way to name an award or press mention in text that search engines and
// AI assistants read (the home article, /llms.txt). The items themselves are
// edited in /admin/press.

/** True when the title already names its issuer ("MB100 — Marco Beteta"),
 *  so a line does not repeat it. */
// Words too common to tell two names apart ("The Wall Street Journal").
const FILLER = new Set(["the", "and", "del", "los", "las", "for"]);

export function namesIssuer(title: string, issuer: string): boolean {
  const words = (s: string) =>
    (s.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []).filter((w) => !FILLER.has(w));
  const inTitle = new Set(words(title));
  return words(issuer).every((w) => inTitle.has(w));
}

/** "MICHELIN Star & Green Star — MICHELIN Guide (2025)". The year is left out
 *  when the title already carries one ("Best Travel Destinations 2026"). */
export function recognitionLabel(item: { title: string; issuer: string; publishedAt: string }): string {
  const who = namesIssuer(item.title, item.issuer) ? item.title : `${item.title} — ${item.issuer}`;
  return /\b(19|20)\d{2}\b/.test(item.title) ? who : `${who} (${item.publishedAt.slice(0, 4)})`;
}
