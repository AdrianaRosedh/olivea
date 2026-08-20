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

/**
 * The property's postal address and coordinates.
 *
 * One definition, because there were already three and one of them was wrong.
 * `global_settings.contact_info` in Supabase still holds seed placeholders for
 * these fields — "Carretera Tecate-Ensenada Km 83" at 32.0789/-116.6123, about
 * ten kilometres from the actual property, alongside a fake maps URL
 * ("maps.app.goo.gl/oLiVeA") and an embed full of zeroes. Nothing consumed
 * them, so nobody noticed; the contact page deliberately reads only `email`
 * and `phone` from that row.
 *
 * Email and phone ARE real there and stay CMS-driven. Address and coordinates
 * live here until the CMS row is cleaned up, so that generated documents and
 * JSON-LD cannot publish a location that would send someone to the wrong gate.
 */
export const SITE_ADDRESS = {
  streetAddress: "Carretera Ensenada-Tecate Km 92.5, Villa de Juárez",
  addressLocality: "Ensenada",
  addressRegion: "Baja California",
  postalCode: "22766",
  addressCountry: "MX",
} as const;

export const SITE_GEO = {
  latitude: 31.9909261,
  longitude: -116.6420781,
} as const;

/** Single-line address for prose and plain-text documents. */
export function addressOneLine(): string {
  const a = SITE_ADDRESS;
  return `${a.streetAddress}, ${a.postalCode} ${a.addressLocality}, ${a.addressRegion}, Mexico`;
}
