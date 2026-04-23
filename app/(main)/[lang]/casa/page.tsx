// app/(main)/[lang]/casa/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/(main)/[lang]/dictionaries";
import { SITE, canonicalUrl } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";
import { getContent, t as tContent } from "@/lib/content";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";
import CasaContent from "./CasaContent";
import type { SectionData } from "./sections/types";
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";

type CasaMetaShape = {
  casa?: { meta?: { title?: string; description?: string; ogImage?: string } };
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
    dict: CasaMetaShape;
  };

  const isEs = L === "es";

  const fallbackTitle = isEs ? "Casa OLIVEA | Hospedaje del Huerto en Valle de Guadalupe" : "Casa OLIVEA | Farm Stay in Valle de Guadalupe";
  const fallbackDescription = isEs
    ? "Hospedaje integrado al huerto y al restaurante Olivea Farm To Table en Valle de Guadalupe, Baja California. Hospédate dentro del huerto. Donde el huerto es la esencia."
    : "A farm stay integrated with the garden and Olivea Farm To Table in Valle de Guadalupe, Baja California. Stay inside the farm. Where the garden is the essence.";

  const title = dict.casa?.meta?.title ?? fallbackTitle;
  const description = dict.casa?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.casa?.meta?.ogImage ?? dict.metadata?.ogDefault ?? "/images/seo/casa-og.jpg";

  const canonicalPath = `/${L}/casa`;
  const url = canonicalUrl(canonicalPath);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en/casa", es: "/es/casa" },
    },
    openGraph: {
      title,
      description,
      url,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [{ url: canonicalUrl(ogImage), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl(ogImage)],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5e7658",
  viewportFit: "cover",
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";
  const Content = L === "en" ? ContentEn : ContentEs;
  const Article = L === "en" ? ArticleEn : ArticleEs;

  // Fetch Supabase-driven sections (falls back gracefully)
  const casaContent = await getContent("casa");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasSections = casaContent.sections && (casaContent.sections as any[]).length > 0;
  const faq: FaqItem[] = casaContent.faq
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      q: tContent(L, item.question),
      a: tContent(L, item.answer),
    }));

  const faqId = canonicalUrl(`/${L}/casa#faq`);

  // Hoisted by React 19 into <head> — preloads the LCP hero image
  // and emits page-level WebPage + BreadcrumbList JSON-LD.
  const pageUrl = canonicalUrl(`/${L}/casa`);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name:
      L === "es"
        ? "Casa Olivea | Hospedaje del Huerto en Valle de Guadalupe"
        : "Casa Olivea | Farm Stay in Valle de Guadalupe",
    description:
      L === "es"
        ? "Hospedaje integrado al huerto y al restaurante con estrella MICHELIN en Valle de Guadalupe, Baja California."
        : "Farm stay integrated with a working garden and MICHELIN-starred restaurant in Valle de Guadalupe, Baja California.",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.hotel },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    inLanguage: L === "es" ? "es-MX" : "en-US",
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OLIVEA", item: canonicalUrl(`/${L}`) },
      { "@type": "ListItem", position: 2, name: "Casa Olivea", item: pageUrl },
    ],
  };

  return (
    <div>
      {/* React 19 hoists <link> + <script> into <head> */}
      <link
        rel="preload"
        as="image"
        href="/images/casa/hero.jpg"
        type="image/jpeg"
        fetchPriority="high"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ✅ AI/SEO only: structured FAQ */}
      <FaqJsonLd id={faqId} items={faq} />

      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />

      {hasSections ? (
        <Suspense
          fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
        >
          <CasaContent lang={L} sections={casaContent.sections as SectionData[]} />
        </Suspense>
      ) : (
        <Suspense
          fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
        >
          <Content />
        </Suspense>
      )}
    </div>
  );
}
