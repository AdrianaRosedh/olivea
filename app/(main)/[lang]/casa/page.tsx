// app/(main)/[lang]/casa/page.tsx
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

  const faq: FaqItem[] =
    L === "es"
      ? [
          {
            q: "¿Por qué hospedarse en Casa Olivea en Valle de Guadalupe?",
            a: "Casa Olivea es un hospedaje integrado al huerto y conectado a Olivea Farm To Table, ideal para vivir la hospitalidad del huerto: hospedaje, gastronomía y naturaleza en el mismo lugar.",
          },
          {
            q: "¿Casa Olivea está en Valle de Guadalupe o Ensenada?",
            a: "Casa Olivea está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California.",
          },
          {
            q: "¿Puedo cenar en Olivea Farm To Table si me hospedo en Casa Olivea?",
            a: "Sí. Recomendamos reservar con anticipación. La experiencia está diseñada para disfrutar hospedaje y cena en la misma propiedad.",
          },
          {
            q: "¿Qué más hay en la propiedad de Olivea?",
            a: "Además de Casa Olivea, la propiedad incluye Olivea Farm To Table, un restaurante con estrella MICHELIN, y Olivea Café, con café de especialidad y desayunos. Las tres experiencias comparten el huerto.",
          },
        ]
      : [
          {
            q: "Why stay at Casa Olivea in Valle de Guadalupe?",
            a: "Casa Olivea is a farm stay integrated with the garden and connected to Olivea Farm To Table — ideal for experiencing farm hospitality: stay, dine, and wake up inside the garden.",
          },
          {
            q: "Is Casa Olivea in Valle de Guadalupe or Ensenada?",
            a: "Casa Olivea is located in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California.",
          },
          {
            q: "Can I dine at Olivea Farm To Table if I stay at Casa Olivea?",
            a: "Yes. We recommend booking in advance. The experience is designed for guests to enjoy dining and staying in one place.",
          },
          {
            q: "What else is on the Olivea property?",
            a: "Besides Casa Olivea, the property includes Olivea Farm To Table, a MICHELIN-starred restaurant, and Olivea Café, serving specialty coffee and breakfast. All three share the same working garden.",
          },
        ];

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

      <Suspense
        fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
      >
        <Content />
      </Suspense>
    </div>
  );
}
