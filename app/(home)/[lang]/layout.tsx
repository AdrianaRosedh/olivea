// app/(home)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import FixedLCP from "./FixedLCP";
import { SITE, canonicalUrl } from "@/lib/site";
import StructuredDataServer from "@/components/seo/StructuredDataServer";

export const viewport: Viewport = {
  themeColor: "#5a6852",
};

export async function generateMetadata(
  { params: { lang } }: { params: { lang: "es" | "en" } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const isEs = lang === "es";

  const title = isEs ? "OLIVEA · La Experiencia" : "OLIVEA · The Experience";

  // Keep this consistent with your MICHELIN-aligned dictionaries (high trust)
  const description = isEs
    ? "Olivea: restaurante de menú degustación con reconocimiento MICHELIN, hotel boutique y café nacidos del huerto en Valle de Guadalupe, Baja California. Donde el huerto es la esencia."
    : "Olivea: a MICHELIN-recognized tasting-menu restaurant, boutique hotel, and café rooted in a living garden in Valle de Guadalupe, Baja California. Where the garden is the essence.";

  const canonicalPath = isEs ? "/es" : "/en";
  const url = canonicalUrl(canonicalPath);
  const ogImage = canonicalUrl("/images/og/cover.jpg");

  return {
    title,
    description,

    // ✅ Always canonical (never preview/localhost)
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
  const lang = params.lang;
  const isEs = lang === "es";

  const homePath = isEs ? "/es" : "/en";
  const homeUrl = canonicalUrl(homePath);

  // Canonical nav links (AI likes clean navigation signals)
  const nav = [
    { name: "Casa Olivea", url: canonicalUrl(`/${lang}/casa`) },
    { name: "Olivea Farm To Table", url: canonicalUrl(`/${lang}/farmtotable`) },
    { name: "Olivea Café", url: canonicalUrl(`/${lang}/cafe`) },
    { name: isEs ? "Sostenibilidad" : "Sustainability", url: canonicalUrl(`/${lang}/sustainability`) },
    { name: isEs ? "Bitácora" : "Journal", url: canonicalUrl(`/${lang}/journal`) },
    { name: isEs ? "Prensa" : "Press", url: canonicalUrl(`/${lang}/press`) },
    { name: isEs ? "Contacto" : "Contact", url: canonicalUrl(`/${lang}/contact`) },
  ];

  // Small homepage-specific JSON-LD (optional, but clean)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${homeUrl}#webpage`,
    url: homeUrl,
    name: isEs ? "OLIVEA · La Experiencia" : "OLIVEA · The Experience",
    isPartOf: { "@id": `${SITE.canonicalBaseUrl}#website` },
    about: { "@id": `${SITE.canonicalBaseUrl}#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: canonicalUrl("/images/og/cover.jpg"),
      width: 1200,
      height: 630,
    },
  };

  const navLd = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "@id": `${homeUrl}#sitenav`,
    name: nav.map((n) => n.name),
    url: nav.map((n) => n.url),
  };

  return (
    <>
      <FixedLCP />

      {/* ✅ Full entity graph (MICHELIN + Maps + org) on homepage too */}
      <StructuredDataServer />

      {/* ✅ Lightweight homepage + nav schema (no UI impact) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navLd) }}
      />

      {children}
    </>
  );
}
