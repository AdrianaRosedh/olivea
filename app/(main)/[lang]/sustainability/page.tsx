// app/(main)/[lang]/sustainability/page.tsx
import type { Metadata } from "next";
import PhilosophyClient from "./PhilosophyClient";
import { loadPhilosophySections } from "./load";
import type { Lang } from "./philosophyTypes";

const SITE_URL = "https://www.oliveafarmtotable.com";

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";

  const title = lang === "es" ? "Filosofía | OLIVEA" : "Philosophy | OLIVEA";
  const description =
    lang === "es"
      ? "La filosofía de Olivea en Valle de Guadalupe: origen, identidad, eficiencia, innovación, gastronomía y comunidad — del huerto a la mesa."
      : "Olivea’s philosophy in Valle de Guadalupe: origins, identity, efficiency, innovation, gastronomy, and community — from garden to table.";

  const path = `/${lang}/sustainability`;
  const canonical = `${SITE_URL}${path}`;

  return {
    title,
    description,

    // ✅ Make indexing unambiguous
    robots: { index: true, follow: true },

    // ✅ Canonical + hreflang (prevents split signals)
    alternates: {
      canonical,
      languages: {
        es: `${SITE_URL}/es/sustainability`,
        en: `${SITE_URL}/en/sustainability`,
      },
    },

    openGraph: {
      type: "website",
      url: canonical,
      siteName: "OLIVEA",
      title,
      description,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";
  const sections = loadPhilosophySections(lang);

  return <PhilosophyClient lang={lang} sections={sections} />;
}
