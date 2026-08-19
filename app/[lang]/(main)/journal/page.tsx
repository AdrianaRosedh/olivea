// app/(main)/[lang]/journal/page.tsx
import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";
import { listJournalIndex, type JournalIndexItem } from "@/lib/journal/load";
import JournalClient from "./JournalClient";
import ArticleJournal from "./ArticleJournal";
import { SITE, canonicalUrl } from "@/lib/site";

export const revalidate = 60;

/* ------------------ safe dict helpers (no any) ------------------ */

type UnknownRecord = Record<string, unknown>;

function isRecord(x: unknown): x is UnknownRecord {
  return !!x && typeof x === "object";
}

function getString(obj: unknown, key: string): string | undefined {
  if (!isRecord(obj)) return undefined;
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function getNested(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

function readJournalMeta(dict: unknown) {
  const journal = getNested(dict, "journal");
  const meta = getNested(journal, "meta");

  const title = getString(journal, "title");
  const subtitle = getString(journal, "subtitle");
  const ogImage = getString(meta, "ogImage");

  const metadata = getNested(dict, "metadata");
  const ogDefault = getString(metadata, "ogDefault");

  return { title, subtitle, ogImage, ogDefault };
}

/* ------------------ next ------------------ */

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";
  const dict = await getDictionary(lang);

  const jm = readJournalMeta(dict);

  const title = `${jm.title ?? "Journal"} | Olivea`;
  const description =
    jm.subtitle ??
    (lang === "es"
      ? "Artículos, notas de campo y decisiones del ecosistema Olivea en Valle de Guadalupe — huerto, cocina, hospitalidad y comunidad."
      : "Articles, field notes, and decisions from the Olivea ecosystem in Valle de Guadalupe — garden, kitchen, hospitality, and community.");

  const path = `/${lang}/journal`;
  const canonical = canonicalUrl(path);

  const ogImage = jm.ogImage ?? jm.ogDefault ?? "/images/seo/journal-og.jpg";
  const ogLocale = lang === "es" ? "es_MX" : "en_US";

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),

    robots: { index: true, follow: true },

    alternates: {
      canonical: path,
      languages: {
        es: "/es/journal",
        en: "/en/journal",
      },
    },

    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Olivea",
      locale: ogLocale,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function JournalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);
  const jm = readJournalMeta(dict);

  let posts: JournalIndexItem[] = [];
  try {
    posts = await listJournalIndex(lang);
  } catch (err) {
    console.error(`[journal] Failed to list journal index for ${lang}`, err);
    posts = [];
  }

  // Page-level JSON-LD (Blog + CollectionPage + ItemList of top posts).
  // React 19 hoists <script type="application/ld+json"> into <head>.
  const orgId = `${SITE.baseUrl}#organization`;
  const websiteId = `${SITE.baseUrl}#website`;
  const journalUrl = canonicalUrl(`/${lang}/journal`);

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${journalUrl}#blog`,
    name: "Olivea Journal",
    url: journalUrl,
    inLanguage: lang === "es" ? "es-MX" : "en-US",
    publisher: { "@id": orgId },
    isPartOf: { "@id": websiteId },
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${journalUrl}#collection`,
    name: "Olivea Journal",
    url: journalUrl,
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
  };

  const topPosts = posts.slice(0, 10);
  const itemListLd =
    topPosts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${journalUrl}#itemlist`,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: topPosts.length,
          itemListElement: topPosts.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: canonicalUrl(`/${lang}/journal/${p.slug}`),
            name: p.title ?? `Post ${i + 1}`,
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      {itemListLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      ) : null}

      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <ArticleJournal
        lang={lang}
        title={jm.title ?? (lang === "es" ? "Journal" : "Journal")}
        subtitle={
          jm.subtitle ??
          (lang === "es"
            ? "Artículos, notas y decisiones del ecosistema Olivea."
            : "Articles, field notes, and decisions from the Olivea ecosystem.")
        }
        posts={posts}
      />

      <JournalClient
        lang={lang}
        title={jm.title ?? (lang === "es" ? "Journal" : "Journal")}
        subtitle={
          jm.subtitle ??
          (lang === "es"
            ? "Artículos, notas y decisiones del ecosistema Olivea."
            : "Articles, field notes, and decisions from the Olivea ecosystem.")
        }
        posts={posts}
      />
    </>
  );
}
