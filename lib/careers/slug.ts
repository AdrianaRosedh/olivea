// lib/careers/slug.ts
// ─────────────────────────────────────────────────────────────────────
// Readable, stable URL tokens for job openings.
//
// A role is addressable as /carreras?vacante=<slug>, which is what makes the
// posting shareable, crawlable, and openable straight from the "we're hiring"
// pill. Slugs come from the Spanish title (the one HR always fills in), so the
// URL reads as the job rather than as a UUID.
// ─────────────────────────────────────────────────────────────────────

type SlugSource = { id: string; titleEs: string; titleEn: string };

/** "Productor de Contenido" → "productor-de-contenido" */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    // Strip combining accents so "Producción" and "Produccion" agree.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * The URL token for an opening, in the language of the page linking to it —
 * an English visitor should be sharing /en/carreras?vacante=content-creator,
 * not the Spanish slug. Falls back to the other language, then to the id.
 *
 * Both languages' slugs always resolve (see findOpeningByToken), so links
 * stay valid across a language switch and after this change.
 */
export function openingSlug(o: SlugSource, lang: "es" | "en" = "es"): string {
  const preferred = lang === "en" ? o.titleEn : o.titleEs;
  const fallback = lang === "en" ? o.titleEs : o.titleEn;
  return slugify(preferred) || slugify(fallback) || o.id;
}

/**
 * Resolve a URL token back to an opening.
 *
 * Accepts the slug in either language plus the raw id, so links keep working
 * if HR renames a role — an old Spanish slug simply stops matching and the
 * page opens with no role selected rather than 404-ing.
 */
export function findOpeningByToken<T extends SlugSource>(
  openings: T[],
  token: string | null | undefined
): T | null {
  if (!token) return null;
  const want = token.toLowerCase();
  return (
    openings.find(
      (o) =>
        o.id === token ||
        openingSlug(o, "es") === want ||
        openingSlug(o, "en") === want
    ) ?? null
  );
}

/** Requirements are stored as one-per-line free text from the HR editor. */
export function parseRequirements(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-–—*]+/, "").trim())
    .filter(Boolean);
}
