// lib/site.ts
const env = process.env;

export const CANONICAL_BASE_URL = "https://www.oliveafarmtotable.com";

function inferBaseUrl(): string {
  // Preferred if you explicitly set it in Vercel env (works for previews too)
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL;
  if (env.SITE_URL) return env.SITE_URL;

  // Vercel preview fallback (keeps absolute links working in previews)
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;

  // Final fallback: canonical
  return CANONICAL_BASE_URL;
}

export const SITE = {
  name: "Olivea",
  baseUrl: inferBaseUrl(),
  canonicalBaseUrl: CANONICAL_BASE_URL,
  locales: ["es", "en"] as const,
  defaultLocale: "es",
} as const;

export type Locale = (typeof SITE.locales)[number];

/** Absolute URL for runtime (preview/dev OK). */
export function absoluteUrl(path = "/"): string {
  const base =
    SITE.baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  try {
    return new URL(path, base).toString();
  } catch {
    return path;
  }
}

/** Canonical absolute URL (use for metadata, JSON-LD, sitemap, llms). */
export function canonicalUrl(path = "/"): string {
  try {
    return new URL(path, SITE.canonicalBaseUrl).toString();
  } catch {
    return path;
  }
}

/**
 * Canonical + hreflang for a localised page.
 *
 * Every page that omits `alternates` inherits the root layout's, which maps
 * to the two homepages. So a subpage that forgot it was telling search
 * engines its Spanish equivalent was /es — the front page — and shipping no
 * canonical at all. Five pages were doing exactly that.
 *
 * `subPath` is the part after the locale, with a leading slash and no locale
 * segment: "/carreras", "/journal/mi-articulo", or "" for the homepage.
 *
 * x-default points at Spanish: it is the house language, and the domain's
 * bare paths resolve there.
 */
export function localeAlternates(lang: Locale | string, subPath = "") {
  const path = subPath && !subPath.startsWith("/") ? `/${subPath}` : subPath;
  const es = `/es${path}`;
  const en = `/en${path}`;
  return {
    canonical: lang === "en" ? en : es,
    languages: { es, en, "x-default": es },
  };
}
