// app/(main)/[lang]/sustainability/page.tsx
import type { Metadata } from "next";
import PhilosophyClient from "./PhilosophyClient";
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";
import { loadPhilosophySectionsCms } from "./load";
import { philosophyFaqLd } from "./faq";
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
  // Leads with the name because that is what people actually ask — an
  // assistant asked "why is it called Olivea?" answered by guessing at olive
  // trees, since nothing in the title or description matched the question even
  // though the page has explained the name all along.
  const description =
    lang === "es"
      ? "Por qué Olivea se llama Olivea — del latín oliva, el olivo — y la filosofía detrás: origen, identidad, eficiencia, innovación, gastronomía y comunidad en Valle de Guadalupe, del huerto a la mesa."
      : "Why Olivea is called Olivea — from the Latin oliva, the olive — and the philosophy behind it: origins, identity, efficiency, innovation, gastronomy, and community in Valle de Guadalupe, from garden to table.";

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
  const sections = await loadPhilosophySectionsCms(lang);
  const Article = lang === "en" ? ArticleEn : ArticleEs;
  const faqLd = philosophyFaqLd(lang, canonicalUrl(`/${lang}/sustainability`));

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />
      <PhilosophyClient lang={lang} sections={sections} />

      {/* Assistants answer from whatever they can retrieve and attribute. The
          page already explained the name; this states the question alongside
          the answer so the page can be found by someone asking it. React 19
          hoists ld+json into <head>. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </>
  );
}
