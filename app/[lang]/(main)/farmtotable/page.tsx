// app/(main)/[lang]/farmtotable/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/[lang]/(main)/dictionaries";
import { SITE, canonicalUrl, shareImagePath } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import { toFaqItems } from "@/lib/seo/faq";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";
import { getContent } from "@/lib/content";
import FTTContent from "./FTTContent";
import type { SectionData } from "./sections/types";
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";
import { jsonLdHtml } from "@/lib/seo/json-ld";

type FarmMetaShape = {
  farmtotable?: { meta?: { title?: string; description?: string; ogImage?: string } };
  metadata?: { ogDefault?: string };
};

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;

  const { lang: L, dict } = (await loadDict({ lang: raw })) as {
    lang: Lang;
    dict: FarmMetaShape;
  };

  const isEs = L === "es";

  const fallbackTitle = "Olivea Farm To Table";
  const fallbackDescription = isEs
    ? "Restaurante de menú degustación con estrella MICHELIN, arraigado en un huerto vivo en Valle de Guadalupe, Baja California. Con hospedaje y café en la misma propiedad. Donde el huerto es la esencia."
    : "MICHELIN-starred tasting-menu restaurant rooted in a working garden in Valle de Guadalupe, Baja California. With farm stay and café on the same property. Where the garden is the essence.";

  const title = dict.farmtotable?.meta?.title ?? fallbackTitle;
  const description = dict.farmtotable?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.farmtotable?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/farm-og.jpg";

  const canonicalPath = `/${L}/farmtotable`;
  const url = canonicalUrl(canonicalPath);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en/farmtotable", es: "/es/farmtotable" },
    },
    openGraph: {
      title,
      description,
      url,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [{ url: canonicalUrl(shareImagePath(ogImage)), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl(shareImagePath(ogImage))],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#566d51",
  viewportFit: "cover",
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";
  const Article = L === "en" ? ArticleEn : ArticleEs;

  // Fetch Supabase-driven sections (falls back gracefully)
  const fttData = await getContent('farmtotable');

  // Use Supabase FAQ for JSON-LD if available
  const faqSection = (fttData.sections as SectionData[] | undefined)?.find(
    (s) => s.id === 'faq'
  );
  // sections[faq].items is the single FAQ store: the page renders it, the
  // markup describes it, and the admin edits it. seoFaq and the faq column
  // are retired — their questions were merged in.
  const faq: FaqItem[] = toFaqItems(
    (faqSection as { items?: Array<{ q?: { en?: string; es?: string }; a?: { en?: string; es?: string } }> } | null)?.items,
    L
  );

  const faqId = canonicalUrl(`/${L}/farmtotable#faq`);

  // Hoisted by React 19 into <head> — LCP hero preload + page JSON-LD.
  const pageUrl = canonicalUrl(`/${L}/farmtotable`);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name:
      L === "es"
        ? "Olivea Farm To Table | Restaurante con estrella MICHELIN"
        : "Olivea Farm To Table | MICHELIN-Starred Restaurant",
    description:
      L === "es"
        ? "Restaurante de menú degustación con estrella MICHELIN, hospedaje y café en la misma propiedad en Valle de Guadalupe."
        : "MICHELIN-starred tasting-menu restaurant with farm stay and café on the same property in Valle de Guadalupe.",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.restaurant },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    inLanguage: L === "es" ? "es-MX" : "en-US",
    ...(fttData.updatedAt ? { dateModified: fttData.updatedAt } : {}),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OLIVEA", item: canonicalUrl(`/${L}`) },
      { "@type": "ListItem", position: 2, name: "Olivea Farm To Table", item: pageUrl },
    ],
  };

  return (
    <div>
      {/* React 19 hoists <script> into <head>.
          Hero image preload is emitted automatically by next/image with priority+fetchPriority. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />

      <FaqJsonLd id={faqId} items={faq} />

      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />

      {/* The fallback is no longer a parallel MDX tree. lib/content/data is
          regenerated from the CMS at build time, so `sections` is populated
          even when Supabase is unreachable — the old MDX branch had become
          unreachable, while still carrying text that could contradict the
          live page. See scripts/generate-content-fallback.mjs. */}
      <Suspense
        fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
      >
        <FTTContent lang={L} sections={fttData.sections as SectionData[]} />
      </Suspense>
    </div>
  );
}
