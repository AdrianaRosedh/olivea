// app/(main)/[lang]/cafe/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/(main)/[lang]/dictionaries";
import { SITE, canonicalUrl } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";

type CafeMetaShape = {
  cafe?: { meta?: { title?: string; description?: string; ogImage?: string } };
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
    dict: CafeMetaShape;
  };

  const isEs = L === "es";

  const fallbackTitle = "OLIVEA Café";
  const fallbackDescription = isEs
    ? "Café de especialidad, pan de casa y desayunos junto al huerto de Olivea en Valle de Guadalupe, Baja California. Donde el huerto es la esencia."
    : "Specialty coffee, house bread, and breakfast next to the Olivea garden in Valle de Guadalupe, Baja California. Where the garden is the essence.";

  const title = dict.cafe?.meta?.title ?? fallbackTitle;
  const description = dict.cafe?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.cafe?.meta?.ogImage ?? dict.metadata?.ogDefault ?? "/images/seo/cafe-og.jpg";

  const canonicalPath = `/${L}/cafe`;
  const url = canonicalUrl(canonicalPath);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en/cafe", es: "/es/cafe" },
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

  const faq: FaqItem[] =
    L === "es"
      ? [
          {
            q: "¿Qué es Olivea Café?",
            a: "Un café de especialidad junto al huerto, con pan de casa, desayunos y una atmósfera serena en Valle de Guadalupe.",
          },
          {
            q: "¿Olivea Café está en Ensenada?",
            a: "Sí. Está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California.",
          },
          {
            q: "¿Olivea Café es parte de un restaurante u hotel?",
            a: "Sí. Olivea Café comparte propiedad con Olivea Farm To Table, un restaurante con estrella MICHELIN, y Casa Olivea, el hospedaje del huerto. Las tres experiencias forman la hospitalidad del huerto de Olivea.",
          },
        ]
      : [
          {
            q: "What is Olivea Café?",
            a: "A specialty coffee spot next to the garden, with house bread, breakfast, and a calm atmosphere in Valle de Guadalupe.",
          },
          {
            q: "Is Olivea Café in Ensenada?",
            a: "Yes. It’s located in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California.",
          },
          {
            q: "Is Olivea Café part of a restaurant or hotel?",
            a: "Yes. Olivea Café shares the property with Olivea Farm To Table, a MICHELIN-starred restaurant, and Casa Olivea, the farm stay. Together they form the Olivea farm hospitality ecosystem.",
          },
        ];

  const faqId = canonicalUrl(`/${L}/cafe#faq`);

  // Hoisted by React 19 into <head> — LCP hero preload + page JSON-LD.
  const pageUrl = canonicalUrl(`/${L}/cafe`);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name:
      L === "es"
        ? "Olivea Café | Café de especialidad y desayunos"
        : "Olivea Café | Farm Breakfast & Specialty Coffee",
    description:
      L === "es"
        ? "Café de especialidad, pan de casa y desayunos junto al huerto de Olivea en Valle de Guadalupe."
        : "Specialty coffee, house bread, and farm breakfast next to the Olivea garden in Valle de Guadalupe.",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.cafe },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    inLanguage: L === "es" ? "es-MX" : "en-US",
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OLIVEA", item: canonicalUrl(`/${L}`) },
      { "@type": "ListItem", position: 2, name: "Olivea Café", item: pageUrl },
    ],
  };

  return (
    <div>
      {/* React 19 hoists <link> + <script> into <head> */}
      <link
        rel="preload"
        as="image"
        href="/images/cafe/hero.jpg"
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

      <FaqJsonLd id={faqId} items={faq} />

      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />

      <Suspense
        fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
      >
        <Content />
      </Suspense>
    </div>
  );
}
