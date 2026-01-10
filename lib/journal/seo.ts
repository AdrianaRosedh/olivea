// lib/journal/seo.ts
import type { Metadata } from "next";
import { absoluteUrl, SITE } from "@/lib/site";
import type { JournalFrontmatter } from "./schema";
import { normalizeAuthor } from "./author";

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
  const a = normalizeAuthor(fm.author, fm.lang);

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),

    alternates: {
      canonical,
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
      authors: [a.name],
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

  const a = normalizeAuthor(fm.author, fm.lang);

  const authorEntityId = a.id
    ? absoluteUrl(`/${fm.lang}/journal/author/${a.id}#person`)
    : undefined;

  const authorPageUrl = a.id
    ? absoluteUrl(`/${fm.lang}/journal/author/${a.id}`)
    : undefined;

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
      authorEntityId
        ? {
            "@type": "Person",
            "@id": authorEntityId,
            name: a.name,
            ...(authorPageUrl ? { url: authorPageUrl } : {}),
          }
        : { "@type": "Person", name: a.name },
    ],
    publisher: {
      "@type": "Organization",
      "@id": orgId,
      name: "Olivea",
      url: absoluteUrl("/"),
    },
  };
}

/** Optional: ItemList JSON-LD for "best places" list posts */
export function buildItemListJsonLd(fm: JournalFrontmatter) {
  const list = fm.seo?.itemList;
  if (!list) return null;

  const pageUrl = absoluteUrl(journalPath(fm.lang, fm.slug));

  const items = list.items.map((it, idx) => {
    const url = it.url ? toAbs(it.url) : undefined;
    const image = it.image ? toAbs(it.image) : undefined;

    // We keep this lightweight: ListItem + (optionally) Place/Restaurant-like info.
    // Search engines mainly need the ordered list + names + URLs.
    return {
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      url: url,
      item: {
        "@type": "Place",
        name: it.name,
        ...(url ? { url } : {}),
        ...(image ? { image } : {}),
        ...(it.address ? { address: it.address } : {}),
        ...(it.geo
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: it.geo.lat,
                longitude: it.geo.lng,
              },
            }
          : {}),
        ...(it.description ? { description: it.description } : {}),
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    url: pageUrl,
    name: list.title,
    ...(list.description ? { description: list.description } : {}),
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: items.length,
    itemListElement: items,
  };
}

/** Optional: FAQPage JSON-LD */
export function buildFaqJsonLd(fm: JournalFrontmatter) {
  const faq = fm.seo?.faq;
  if (!faq || faq.length === 0) return null;

  const pageUrl = absoluteUrl(journalPath(fm.lang, fm.slug));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faq.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: x.a,
      },
    })),
  };
}
