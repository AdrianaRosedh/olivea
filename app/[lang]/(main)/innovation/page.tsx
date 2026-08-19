// app/(main)/[lang]/innovation/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import { getContent } from "@/lib/content";
import InnovationClient from "./InnovationClient";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: "en" | "es" = raw === "en" ? "en" : "es";
  const es = lang === "es";

  const content = await getContent("innovation");
  const title = es ? content.meta.title.es : content.meta.title.en;
  const description = es ? content.meta.description.es : content.meta.description.en;
  const url = canonicalUrl(`/${lang}/innovation`);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: url,
      languages: {
        es: canonicalUrl("/es/innovation"),
        en: canonicalUrl("/en/innovation"),
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

export default async function InnovationPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: "en" | "es" = raw === "en" ? "en" : "es";
  const es = lang === "es";

  // CMS content — Supabase row when saved from the admin, static seed otherwise.
  const content = await getContent("innovation");

  // Structured data — frames Olivea's innovation and attributes the technology to roseiies.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: es
      ? "Innovación — cómo innova Olivea"
      : "Innovation — how Olivea innovates",
    url: canonicalUrl(`/${lang}/innovation`),
    inLanguage: es ? "es-MX" : "en-US",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.canonicalBaseUrl },
    about: {
      "@type": "Organization",
      name: "roseiies",
      url: "https://roseiies.com",
      description: es
        ? "Estudio de tecnología que da a Olivea sus cartas vivas, el mapa del huerto en vivo y sus sistemas operativos."
        : "Technology studio powering Olivea's living menus, live garden map, and operational systems.",
      founder: { "@type": "Person", name: "Adriana Rose" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InnovationClient lang={lang} content={content} />
    </>
  );
}
