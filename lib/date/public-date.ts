// lib/date/public-date.ts
//
// Formatting for dates that are rendered on the server AND again in the
// browser when React hydrates.
//
// Every published date on this site is authored as a calendar day —
// "2026-03-01", no time and no zone. Passing one to toLocaleDateString
// resolves it in whatever timezone the code happens to be running in, and the
// two runtimes do not agree: Vercel renders in UTC, while a visitor in Valle
// de Guadalupe is seven or eight hours behind it. UTC midnight on the 1st is
// still the evening of the 28th for that visitor, so the server sent
// "01 mar 2026" and the browser's first render produced "28 feb 2026". React
// sees the text nodes disagree, calls it a hydration mismatch (#418) and
// throws the whole subtree away to re-render it on the client.
//
// This never reproduced in local testing because the dev server and the
// browser share one machine's clock — the disagreement needs a UTC server and
// a visitor who is not on UTC, which only happens in production.
//
// Pinning the format to UTC keeps both sides on the day that was authored.
// Read the year off the string rather than through a Date for the same
// reason: 1 January would otherwise land in the previous year west of UTC.

export type DateLang = "es" | "en";

const localeOf = (lang: DateLang) => (lang === "es" ? "es-MX" : "en-US");

/** Date-only values are already UTC per the ISO spec; timestamps pass through. */
function parse(iso: string): Date {
  return new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
}

/** "01 mar 2026" — the compact form used on cards, lists and press rows. */
export function formatPublicDate(iso: string, lang: DateLang): string {
  const d = parse(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(localeOf(lang), {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}

/** "1 de marzo de 2026" — the long form used on article and author bylines. */
export function formatPublicDateLong(iso: string, lang: DateLang): string {
  const d = parse(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(localeOf(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The authored calendar year, for the year filters. Taken off the string so
 * it cannot drift across a timezone the way a parsed Date can.
 */
export function publicDateYear(iso: string): number {
  const y = Number(String(iso ?? "").slice(0, 4));
  return Number.isFinite(y) && y > 0 ? y : NaN;
}
