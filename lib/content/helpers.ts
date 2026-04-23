// lib/content/helpers.ts
// ─────────────────────────────────────────────────────────────────────
// Utility functions for working with bilingual content in components.
// ─────────────────────────────────────────────────────────────────────

import type { Bilingual, BilingualRich, SiteImage } from "./types";

type Lang = "es" | "en";

/**
 * Resolve a Bilingual field to the correct language string.
 *
 * @example
 *   const title = t(lang, content.hero.title);
 *   // → "Where the garden is the essence." (en)
 *   // → "Donde el huerto es la esencia." (es)
 */
export function t(lang: Lang, field: Bilingual): string {
  return field[lang] || field.en; // fall back to English
}

/**
 * Resolve a BilingualRich field (HTML/MDX string).
 * Same as `t` but typed for clarity.
 */
export function tRich(lang: Lang, field: BilingualRich): string {
  return field[lang] || field.en;
}

/**
 * Resolve a SiteImage's alt text to the correct language.
 *
 * @example
 *   <Image src={img.src} alt={resolveImage(lang, img)} />
 */
export function resolveImage(lang: Lang, image: SiteImage): string {
  return t(lang, image.alt);
}

/**
 * Build a page's metadata object from a PageMeta content block.
 * Designed to be spread into Next.js generateMetadata return.
 *
 * @example
 *   export async function generateMetadata({ params }) {
 *     const content = await getContent("casa");
 *     return buildMeta(lang, content.meta, "/casa");
 *   }
 */
export function buildMeta(
  lang: Lang,
  meta: { title: Bilingual; description: Bilingual; ogImage?: string; keywords?: string[] },
  canonicalPath: string,
  opts?: { siteName?: string; canonicalBase?: string }
) {
  const title = t(lang, meta.title);
  const description = t(lang, meta.description);
  const siteName = opts?.siteName ?? "OLIVEA";
  const base = opts?.canonicalBase ?? "https://www.oliveafarmtotable.com";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${canonicalPath}`,
      languages: {
        en: `/en${canonicalPath}`,
        es: `/es${canonicalPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${base}/${lang}${canonicalPath}`,
      locale: lang === "es" ? "es_MX" : "en_US",
      type: "website" as const,
      siteName,
      ...(meta.ogImage
        ? {
            images: [
              {
                url: `${base}${meta.ogImage}`,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      ...(meta.ogImage ? { images: [`${base}${meta.ogImage}`] } : {}),
    },
    ...(meta.keywords ? { keywords: meta.keywords } : {}),
  };
}
