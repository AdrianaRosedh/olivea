// lib/site.ts
const env = process.env;

function inferBaseUrl(): string {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL; // preferred (client + server)
  if (env.SITE_URL) return env.SITE_URL;                         // server-only fallback
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;        // vercel
  return "";                                                     // let runtime fill in
}

export const SITE = {
  name: "Olivea",
  baseUrl: inferBaseUrl(),
  locales: ["es", "en"] as const,
  defaultLocale: "es",
} as const;

export type Locale = (typeof SITE.locales)[number];

/** Always return an absolute URL; robust on client & server. */
export function absoluteUrl(path = "/"): string {
  // prefer configured base; if missing on client, use window.origin
  const base =
    SITE.baseUrl ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  try {
    return new URL(path, base).toString();
  } catch {
    // if `path` is already absolute or invalid, return as-is
    return path;
  }
}
