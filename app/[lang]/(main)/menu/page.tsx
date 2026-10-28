// app/(main)/[lang]/menu/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl, withShare } from "@/lib/site";
import { type Lang } from "@/lib/i18n";
import { Suspense } from "react";
import MenuDeepLinkClient from "./MenuDeepLinkClient";
import ArticleMenu from "./ArticleMenu";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqProse from "@/components/seo/FaqProse";
import { getContent, t } from "@/lib/content";
import { toFaqItems } from "@/lib/seo/faq";

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

async function pageMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "en" ? "en" : "es";
  const isEs = lang === "es";

  // From menu_content, edited in /admin/content/menu-page.
  const { meta } = await getContent("menu");
  const title = t(lang, meta.title);
  const description = t(lang, meta.description);

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
  // The page's FAQ lives in menu_content (edited in /admin/content/menu-page).
  const faq = toFaqItems((await getContent("menu")).faq, L);

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
          items={faq}
          heading={L === "es" ? "Preguntas frecuentes" : "Common questions"}
          label={L === "es" ? "Preguntas frecuentes" : "Common questions"}
        />
      </div>
      <FaqJsonLd id={canonicalUrl(`/${L}/menu#faq`)} items={faq} />
      {/* useSearchParams() needs a boundary now that the tree actually renders
          on the server; without it the whole page opts out of prerendering. */}
      <Suspense fallback={null}>
        <MenuDeepLinkClient lang={lang} />
      </Suspense>
    </>
  );
}

export async function generateMetadata(
  props: Parameters<typeof pageMetadata>[0]
): Promise<Metadata> {
  const { lang } = await props.params;
  return withShare(await pageMetadata(props), { lang, path: "/menu" });
}
