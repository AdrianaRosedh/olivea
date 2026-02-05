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
