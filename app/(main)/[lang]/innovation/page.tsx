// app/(main)/[lang]/innovation/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import InnovationClient from "./InnovationClient";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: "en" | "es" = raw === "en" ? "en" : "es";
  const es = lang === "es";

  const title = es
    ? "Innovación — Cómo innova Olivea | OLIVEA"
    : "Innovation — How Olivea innovates | OLIVEA";
  const description = es
    ? "En Olivea la innovación es donde el arte se encuentra con la tecnología: el laboratorio donde fermentamos, curamos y creamos, y roseiies que se encarga de lo técnico para que el oficio conserve su tiempo."
    : "At Olivea, innovation is where art meets technology — the laboratory where we ferment, cure, and create, and roseiies handling the techy admin so the craft keeps its time.";
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
      <InnovationClient lang={lang} />
    </>
  );
}
