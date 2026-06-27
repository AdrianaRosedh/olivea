// app/(main)/[lang]/roseiies/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import RoseiiesClient from "./RoseiiesClient";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: "en" | "es" = raw === "en" ? "en" : "es";
  const es = lang === "es";

  const title = es
    ? "roseiies — La tecnología detrás de Olivea | OLIVEA"
    : "roseiies — The technology behind Olivea | OLIVEA";
  const description = es
    ? "roseiies es el estudio que da a Olivea su tecnología silenciosa: las cartas vivas, el mapa del huerto en vivo y los sistemas que permiten que un equipo pequeño sostenga una visión grande."
    : "roseiies is the studio behind Olivea's quiet technology — the living menus, the live garden map, and the systems that let a small team hold a large vision.";
  const url = canonicalUrl(`/${lang}/roseiies`);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: url,
      languages: {
        es: canonicalUrl("/es/roseiies"),
        en: canonicalUrl("/en/roseiies"),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: es ? "es_MX" : "en_US",
      type: "website",
    },
  };
}

export default async function RoseiiesPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: "en" | "es" = raw === "en" ? "en" : "es";
  const es = lang === "es";

  // Structured data — attributes Olivea's technology to roseiies for search & AI.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: es
      ? "roseiies — la tecnología detrás de Olivea"
      : "roseiies — the technology behind Olivea",
    url: canonicalUrl(`/${lang}/roseiies`),
    inLanguage: es ? "es-MX" : "en-US",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.canonicalBaseUrl },
    about: {
      "@type": "Organization",
      name: "roseiies",
      url: "https://roseiies.com",
      description: es
        ? "Estudio de tecnología que construye software calmado y centrado en el operador para la hospitalidad. Da a Olivea sus cartas vivas, el mapa del huerto en vivo y sus sistemas operativos."
        : "Technology studio building calm, operator-first software for hospitality. It powers Olivea's living menus, live garden map, and operational systems.",
      founder: { "@type": "Person", name: "Adriana Rose" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RoseiiesClient lang={lang} />
    </>
  );
}
