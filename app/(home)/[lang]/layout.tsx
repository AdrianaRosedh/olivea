// app/(home)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import FixedLCP from "./FixedLCP";
import { SITE, canonicalUrl } from "@/lib/site";
import StructuredDataServer, { ENTITY_IDS } from "@/components/seo/StructuredDataServer";

export const viewport: Viewport = {
  themeColor: "#5a6852",
  viewportFit: "cover",
};

export async function generateMetadata(
  { params: { lang } }: { params: { lang: "es" | "en" } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const isEs = lang === "es";

  const title = isEs ? "OLIVEA · Hospitalidad del Huerto" : "OLIVEA · Farm Hospitality";

  const description = isEs
    ? "Olivea: hospitalidad del huerto en Valle de Guadalupe — restaurante de degustación con estrella MICHELIN, hospedaje y café nacidos del huerto en Baja California. Donde el huerto es la esencia."
    : "Olivea: farm hospitality in Valle de Guadalupe — MICHELIN-starred tasting restaurant, farm stay, and café rooted in a working garden in Baja California. Where the garden is the essence.";

  const canonicalPath = isEs ? "/es" : "/en";
  const url = canonicalUrl(canonicalPath);
  const ogImage = canonicalUrl("/images/og/cover.jpg");

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalPath,
      languages: {
        "es-MX": "/es",
        "en-US": "/en",
        es: "/es",
        en: "/en",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "OLIVEA",
      locale: isEs ? "es_MX" : "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "OLIVEA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function HomeLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: "es" | "en" };
}) {
  const isEs = params.lang === "es";
  const langPrefix = isEs ? "es" : "en";

  const homePath = isEs ? "/es" : "/en";
  const homeUrl = canonicalUrl(homePath);

  // ✅ FIXED: no more `/undefined/...`
  const nav = [
    { name: "Casa Olivea", url: canonicalUrl(`/${langPrefix}/casa`) },
    { name: "Olivea Farm To Table", url: canonicalUrl(`/${langPrefix}/farmtotable`) },
    { name: "Olivea Café", url: canonicalUrl(`/${langPrefix}/cafe`) },
    {
      name: isEs ? "Filosofía" : "Philosophy",
      url: canonicalUrl(`/${langPrefix}/sustainability`),
    },
    { name: isEs ? "Cuaderno" : "Journal", url: canonicalUrl(`/${langPrefix}/journal`) },
    { name: isEs ? "Prensa" : "Press", url: canonicalUrl(`/${langPrefix}/press`) },
    { name: isEs ? "Contacto" : "Contact", url: canonicalUrl(`/${langPrefix}/contact`) },
  ];

  // Homepage page schema (lightweight) — uses shared ENTITY_IDS
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${homeUrl}#webpage`,
    url: homeUrl,
    name: isEs ? "OLIVEA · Hospitalidad del Huerto" : "OLIVEA · Farm Hospitality",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.organization },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: canonicalUrl("/images/og/cover.jpg"),
      width: 1200,
      height: 630,
    },
  };

  // Navigation schema (consistent @id across home + main layouts)
  const navLd = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "@id": `${SITE.canonicalBaseUrl}#sitenav`,
    name: nav.map((n) => n.name),
    url: nav.map((n) => n.url),
  };

  return (
    <>
      <FixedLCP />

      {/* ✅ Full entity graph: Organization + Restaurant + Hotel + Café + MICHELIN + Maps */}
      <StructuredDataServer />

      {/* ✅ Homepage + navigation schema (no UI impact) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navLd) }}
      />

      {children}
    </>
  );
}
