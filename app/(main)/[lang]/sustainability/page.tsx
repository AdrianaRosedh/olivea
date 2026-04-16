// app/(main)/[lang]/sustainability/page.tsx
import type { Metadata } from "next";
import PhilosophyClient from "./PhilosophyClient";
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";
import { loadPhilosophySections } from "./load";
import { canonicalUrl } from "@/lib/site";
import type { Lang } from "./philosophyTypes";

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
  const canonical = canonicalUrl(path);

  return {
    title,
    description,

    // ✅ Make indexing unambiguous
    robots: { index: true, follow: true },

    // ✅ Canonical + hreflang (prevents split signals)
    alternates: {
      canonical,
      languages: {
        es: canonicalUrl("/es/sustainability"),
        en: canonicalUrl("/en/sustainability"),
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
  const Article = lang === "en" ? ArticleEn : ArticleEs;

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />
      <PhilosophyClient lang={lang} sections={sections} />
    </>
  );
}
