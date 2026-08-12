// lib/utils/optimize-html-images.ts
// ─────────────────────────────────────────────────────────────────────
// Route <img> tags inside stored HTML through the Next image optimizer.
//
// Article bodies are authored in the admin block editor and rendered with
// dangerouslySetInnerHTML, so their images never touch next/image: they ship
// as the original upload, in the original format, with no srcset and no lazy
// loading. A single article can carry several full-size JPEGs that way.
//
// Rewriting the markup server-side gets AVIF/WebP, responsive widths and lazy
// loading without replacing the HTML pipeline or adding a parser dependency.
// ─────────────────────────────────────────────────────────────────────

/** Subset of next.config deviceSizes that is useful inside an 860px column. */
const WIDTHS = [640, 750, 828, 1080, 1200, 1920];
/** The article column is max-w-215 (860px); 2x covers retina. */
const DEFAULT_SIZES = "(max-width: 768px) 100vw, 860px";
const FALLBACK_WIDTH = 1200;
const QUALITY = 75;

/** `&` must be escaped inside an HTML attribute value. */
function nextImageUrl(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&amp;w=${width}&amp;q=${QUALITY}`;
}

/**
 * Only rewrite what the optimizer can actually fetch: same-origin paths and
 * hosts declared in next.config remotePatterns. Anything else is returned
 * untouched — a wrong rewrite would 400 and break the image entirely.
 */
function isOptimizable(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/_next/image")) return false; // already done
  if (/^(data:|blob:)/i.test(src)) return false;
  if (src.startsWith("/")) return true; // local /public asset
  return /^https:\/\/[^/]+\.supabase\.co\//i.test(src);
}

export function optimizeHtmlImages(html: string): string {
  if (!html) return html;

  return html.replace(/<img\b([^>]*?)\/?>/gi, (full, rawAttrs: string) => {
    const srcMatch = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(rawAttrs);
    if (!srcMatch) return full;

    const src = srcMatch[1];
    if (!isOptimizable(src)) return full;

    let attrs = rawAttrs.replace(
      /\ssrc\s*=\s*["'][^"']+["']/i,
      ` src="${nextImageUrl(src, FALLBACK_WIDTH)}"`
    );

    if (!/\ssrcset\s*=/i.test(attrs)) {
      const srcset = WIDTHS.map((w) => `${nextImageUrl(src, w)} ${w}w`).join(", ");
      attrs += ` srcset="${srcset}"`;
    }
    if (!/\ssizes\s*=/i.test(attrs)) attrs += ` sizes="${DEFAULT_SIZES}"`;
    // Body images sit below the fold by definition — the cover is the LCP.
    if (!/\sloading\s*=/i.test(attrs)) attrs += ` loading="lazy"`;
    if (!/\sdecoding\s*=/i.test(attrs)) attrs += ` decoding="async"`;

    return `<img${attrs}>`;
  });
}
