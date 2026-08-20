// app/(main)/[lang]/menu/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import { type Lang } from "@/lib/i18n";
import { Suspense } from "react";
import MenuDeepLinkClient from "./MenuDeepLinkClient";
import ArticleMenu from "./ArticleMenu";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqProse from "@/components/seo/FaqProse";
import { menuFaq } from "./faq";

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "en" ? "en" : "es";
  const isEs = lang === "es";

  const title = isEs ? "Menú | OLIVEA" : "Menu | OLIVEA";
  const description = isEs
    ? "Menú de temporada de Olivea Farm To Table y Olivea Café Wine Bar — cocina arraigada al huerto en Valle de Guadalupe."
    : "Seasonal menu for Olivea Farm To Table and Olivea Café Wine Bar — garden-rooted cuisine in Valle de Guadalupe.";

  const path = `/${lang}/menu`;
  const url = canonicalUrl(path);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: url,
      languages: { es: canonicalUrl("/es/menu"), en: canonicalUrl("/en/menu") },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
    },
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const L: Lang = lang === "en" ? "en" : "es";

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          The client component redirects to /farmtotable#menu,
          but crawlers need content on this URL. */}
      <ArticleMenu lang={L} />
      {/* The questions that decide a booking — à la carte or tasting,
          vegetarian, pairings — are answered on the venue pages but not on the
          page a search for "Olivea menu" lands on. */}
      <div className="ssr-article">
        <FaqProse
          items={menuFaq(L)}
          heading={L === "es" ? "Preguntas frecuentes" : "Common questions"}
          label={L === "es" ? "Preguntas frecuentes" : "Common questions"}
        />
      </div>
      <FaqJsonLd id={canonicalUrl(`/${L}/menu#faq`)} items={menuFaq(L)} />
      {/* useSearchParams() needs a boundary now that the tree actually renders
          on the server; without it the whole page opts out of prerendering. */}
      <Suspense fallback={null}>
        <MenuDeepLinkClient lang={lang} />
      </Suspense>
    </>
  );
}
