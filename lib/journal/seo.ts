import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import type { JournalFrontmatter } from "./schema";

export function journalPath(lang: "es" | "en", slug: string) {
  return `/${lang}/journal/${slug}`;
}

export function buildJournalMetadata(args: {
  fm: JournalFrontmatter;
  otherLangSlug: string | null;
}): Metadata {
  const { fm, otherLangSlug } = args;

  const url = absoluteUrl(journalPath(fm.lang, fm.slug));
  const canonical = fm.seo?.canonical ? fm.seo.canonical : url;

  const title = fm.seo?.title || fm.title;
  const description = fm.seo?.description || fm.excerpt;
  const ogImage = fm.seo?.ogImage || fm.cover?.src;

  const robots = fm.seo?.noindex ? { index: false, follow: false } : undefined;

  const esUrl =
    fm.lang === "es"
      ? url
      : otherLangSlug
        ? absoluteUrl(journalPath("es", otherLangSlug))
        : absoluteUrl(journalPath("es", fm.slug));

  const enUrl =
    fm.lang === "en"
      ? url
      : otherLangSlug
        ? absoluteUrl(journalPath("en", otherLangSlug))
        : absoluteUrl(journalPath("en", fm.slug));

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "es-MX": esUrl,
        en: enUrl,
      },
    },
    robots,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: ogImage ? [{ url: ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage) }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage)] : [],
    },
  };
}

export function buildArticleJsonLd(args: {
  fm: JournalFrontmatter;
  readingMinutes: number;
}) {
  const { fm, readingMinutes } = args;

  const url = absoluteUrl(journalPath(fm.lang, fm.slug));
  const image = fm.seo?.ogImage || fm.cover?.src;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: fm.title,
    description: fm.excerpt,
    inLanguage: fm.lang === "es" ? "es-MX" : "en",
    datePublished: fm.publishedAt,
    dateModified: fm.updatedAt ?? fm.publishedAt,
    url,
    image: image ? (image.startsWith("http") ? image : absoluteUrl(image)) : undefined,
    timeRequired: `PT${Math.max(1, readingMinutes)}M`,
    publisher: {
      "@type": "Organization",
      name: "Olivea",
      url: absoluteUrl("/"),
    },
  };
}
