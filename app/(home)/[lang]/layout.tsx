// app/(home)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import FixedLCP from "./FixedLCP";
import { SITE } from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#5a6852",
};

export async function generateMetadata(
  { params: { lang } }: { params: { lang: "es" | "en" } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const isEs = lang === "es";

  const title = isEs ? "OLIVEA · La Experiencia" : "OLIVEA · The Experience";
  const description = isEs
    ? "Olivea: restaurante de degustación, hotel y café nacidos del huerto en Valle de Guadalupe. Donde el huerto es la esencia."
    : "Olivea: a tasting-menu restaurant, boutique hotel and café rooted in a living garden in Valle de Guadalupe. Where the garden is the essence.";

  const canonicalPath = isEs ? "/es" : "/en";
  const url = `${SITE.baseUrl}${canonicalPath}`;
  const ogImage = `${SITE.baseUrl}/images/og/cover.jpg`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalPath,
      languages: {
        es: "/es",
        en: "/en",
        "es-MX": "/es",
        "en-US": "/en",
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

  const siteUrl = SITE.baseUrl;
  const homeUrl = `${siteUrl}${isEs ? "/es" : "/en"}`;

  const nav = [
    { name: "Casa Olivea", url: `${siteUrl}/${lang}/casa` },
    { name: "Olivea Farm To Table", url: `${siteUrl}/${lang}/farmtotable` },
    { name: "Olivea Café", url: `${siteUrl}/${lang}/cafe` },
    { name: isEs ? "Sostenibilidad" : "Sustainability", url: `${siteUrl}/${lang}/sustainability` },
    { name: isEs ? "Bitácora" : "Journal", url: `${siteUrl}/${lang}/journal` },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "OLIVEA",
      url: homeUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      name: nav.map((n) => n.name),
      url: nav.map((n) => n.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "OLIVEA",
      url: siteUrl,
    },
  ];

  return (
    <>
      <FixedLCP />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {children}
    </>
  );
}
