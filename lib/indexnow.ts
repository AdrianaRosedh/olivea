// lib/indexnow.ts
// ─────────────────────────────────────────────────────────────────────
// IndexNow — instantly notify Bing (and other participating engines:
// Yandex, Seznam, Naver) the moment content changes, so updates hit the
// index in minutes instead of waiting for a crawl. Bing powers Microsoft
// Copilot and feeds ChatGPT Search, so this keeps AI visibility fresh.
//
// The key is public by design (served at /<key>.txt). It is NOT a secret.
// ─────────────────────────────────────────────────────────────────────
import { canonicalUrl, SITE } from "@/lib/site";

const KEY = "11e9c9b406171c6aa33b03c93aac647e";
const HOST = new URL(SITE.canonicalBaseUrl).host;
const KEY_LOCATION = canonicalUrl(`/${KEY}.txt`);
const ENDPOINT = "https://api.indexnow.org/indexnow";

// For site-wide (layout) changes — global settings, footer, drawer — we ping
// the high-value pages rather than the entire tree.
const CORE_PATHS = [
  "/es", "/en",
  "/es/farmtotable", "/en/farmtotable",
  "/es/casa", "/en/casa",
  "/es/cafe", "/en/cafe",
  "/es/contact", "/en/contact",
  "/es/sustainability", "/en/sustainability",
  "/es/menu", "/en/menu",
  "/es/journal", "/en/journal",
  "/es/press", "/en/press",
  "/es/team", "/en/team",
  "/es/legal", "/en/legal",
];

/** Submit full URLs to IndexNow. Fire-safe: logs and swallows any error. */
export async function pingIndexNow(urls: string[]): Promise<void> {
  const urlList = [...new Set(urls)].filter(Boolean);
  if (urlList.length === 0) return;
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
  } catch (err) {
    console.error("[indexnow] ping failed:", err);
  }
}

/** Map revalidation paths (incl. "layout:" markers) → canonical URLs, then submit. */
export async function pingIndexNowForPaths(paths: string[]): Promise<void> {
  const resolved = paths.flatMap((p) => (p.startsWith("layout:") ? CORE_PATHS : [p]));
  await pingIndexNow(resolved.map((p) => canonicalUrl(p)));
}
