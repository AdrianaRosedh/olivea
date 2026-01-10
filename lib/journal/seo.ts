import type { Metadata } from "next";
import { absoluteUrl, SITE } from "@/lib/site";
import type { JournalFrontmatter } from "./schema";

export function journalPath(lang: "es" | "en", slug: string) {
  return `/${lang}/journal/${slug}`;
}

function toAbs(urlOrPath?: string): string | undefined {
  if (!urlOrPath) return undefined;
  return urlOrPath.startsWith("http") ? urlOrPath : absoluteUrl(urlOrPath);
}

function pickOgImage(fm: JournalFrontmatter): string | undefined {
  return fm.seo?.ogImage ?? fm.cover?.src ?? undefined;
}

function pickDescription(fm: JournalFrontmatter): string {
  return fm.seo?.description ?? fm.excerpt ?? "";
}

function pickTitle(fm: JournalFrontmatter): string {
  return fm.seo?.title ?? fm.title;
}

function authorNameFromFm(fm: JournalFrontmatter): string {
  const a = fm.author as unknown;
  if (typeof a === "string" && a.trim()) return a.trim();
  if (a && typeof a === "object") {
    const o = a as Record<string, unknown>;
    const n = typeof o.name === "string" ? o.name.trim() : "";
    if (n) return n;
  }
  return fm.lang === "es" ? "Equipo Olivea" : "Olivea Editorial";
}

export function buildJournalMetadata(args: {
  fm: JournalFrontmatter;
  otherLangSlug: string | null;
}): Metadata {
  const { fm, otherLangSlug } = args;

  const url = absoluteUrl(journalPath(fm.lang, fm.slug));
  const canonical = fm.seo?.canonical ? fm.seo.canonical : url;

  const title = pickTitle(fm);
  const description = pickDescription(fm);
  const ogImageRaw = pickOgImage(fm);
  const ogImage = toAbs(ogImageRaw);

  const otherEsSlug = fm.lang === "es" ? fm.slug : otherLangSlug ?? fm.slug;
  const otherEnSlug = fm.lang === "en" ? fm.slug : otherLangSlug ?? fm.slug;

  const esUrl = absoluteUrl(journalPath("es", otherEsSlug));
  const enUrl = absoluteUrl(journalPath("en", otherEnSlug));

  const robots = fm.seo?.noindex
    ? { index: false, follow: false }
    : { index: true, follow: true };

  const locale = fm.lang === "es" ? "es_MX" : "en_US";
  const authorName = authorNameFromFm(fm);

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),

    alternates: {
      canonical,
      // ✅ Next-friendly keys
      languages: {
        es: esUrl,
        en: enUrl,
      },
    },

    robots,

    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "Olivea",
      locale,
      publishedTime: fm.publishedAt,
      modifiedTime: fm.updatedAt ?? fm.publishedAt,
      authors: [authorName],
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export function buildArticleJsonLd(args: {
  fm: JournalFrontmatter;
  readingMinutes: number;
}) {
  const { fm, readingMinutes } = args;

  const url = absoluteUrl(journalPath(fm.lang, fm.slug));
  const imageRaw = pickOgImage(fm);
  const image = toAbs(imageRaw);

  const authorName = authorNameFromFm(fm);

  const orgId = `${SITE.baseUrl}#organization`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: fm.title,
    description: fm.excerpt,
    inLanguage: fm.lang === "es" ? "es-MX" : "en-US",
    datePublished: fm.publishedAt,
    dateModified: fm.updatedAt ?? fm.publishedAt,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: image ? [image] : undefined,
    timeRequired: `PT${Math.max(1, readingMinutes)}M`,
    author: [
      {
        "@type": "Person",
        name: authorName,
      },
    ],
    publisher: {
      "@type": "Organization",
      "@id": orgId,
      name: "Olivea",
      url: absoluteUrl("/"),
    },
  };
}
