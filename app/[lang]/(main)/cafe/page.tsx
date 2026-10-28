// app/(main)/[lang]/cafe/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/[lang]/(main)/dictionaries";
import { SITE, canonicalUrl, shareImagePath } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import { toFaqItems, faqSectionOf } from "@/lib/seo/faq";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";
import { getContent } from "@/lib/content";
import CafeContent from "./CafeContent";
import type { SectionData } from "./sections/types";
import CafeArticle from "./CafeArticle";
import { jsonLdHtml } from "@/lib/seo/json-ld";

type CafeMetaShape = {
  cafe?: { meta?: { title?: string; description?: string; ogImage?: string } };
  metadata?: { ogDefault?: string };
};

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;

  const { lang: L, dict } = (await loadDict({ lang: raw })) as {
    lang: Lang;
    dict: CafeMetaShape;
  };

  const isEs = L === "es";

  const fallbackTitle = "OLIVEA Café";
  const fallbackDescription = isEs
    ? "Café de especialidad, pan de casa y desayunos junto al huerto de Olivea en Valle de Guadalupe, Baja California. Donde el huerto es la esencia."
    : "Specialty coffee, house bread, and breakfast next to the Olivea garden in Valle de Guadalupe, Baja California. Where the garden is the essence.";

  // Supabase meta first (what /admin edits); the static dictionary and the
  // lines above only cover a missing row.
  const meta = (await getContent("cafe").catch(() => null))?.meta;
  const title = meta?.title?.[L] || dict.cafe?.meta?.title || fallbackTitle;
  const description = meta?.description?.[L] || dict.cafe?.meta?.description || fallbackDescription;

  const ogImage =
    meta?.ogImage || dict.cafe?.meta?.ogImage || dict.metadata?.ogDefault || "/images/seo/cafe-og.jpg";

  const canonicalPath = `/${L}/cafe`;
  const url = canonicalUrl(canonicalPath);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en/cafe", es: "/es/cafe" },
    },
    openGraph: {
      title,
      description,
      url,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [{ url: canonicalUrl(shareImagePath(ogImage)), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl(shareImagePath(ogImage))],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#566d51",
  viewportFit: "cover",
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";

  // Fetch Supabase-driven sections (falls back gracefully)
  const cafeContent = await getContent("cafe");
  // sections[faq].items is the single FAQ store: the page renders it, the
  // markup describes it, and the admin edits it. It used to be one of three.
  const faq: FaqItem[] = toFaqItems(faqSectionOf(cafeContent.sections)?.items, L);

  const faqId = canonicalUrl(`/${L}/cafe#faq`);

  // Hoisted by React 19 into <head> — LCP hero preload + page JSON-LD.
  const pageUrl = canonicalUrl(`/${L}/cafe`);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    // The CMS meta, so the page's own JSON-LD says what its <title> says.
    name:
      cafeContent.meta?.title?.[L] ??
      (L === "es"
        ? "OLIVEA Café Wine Bar | Café, panadería y vino en Valle de Guadalupe"
        : "OLIVEA Café Wine Bar | Coffee, Bakery & Wine in Valle de Guadalupe"),
    description:
      cafeContent.meta?.description?.[L] ??
      (L === "es"
        ? "Café de especialidad, croissants, conchas y panes de temporada hechos en casa, desayuno y brunch, y vino del Valle de Guadalupe junto al huerto. Sin reservación."
        : "Specialty coffee, croissants, conchas and seasonal breads baked in-house, breakfast and brunch, and Valle de Guadalupe wine beside the garden. No reservation needed."),
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.cafe },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    inLanguage: L === "es" ? "es-MX" : "en-US",
    ...(cafeContent.updatedAt ? { dateModified: cafeContent.updatedAt } : {}),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OLIVEA", item: canonicalUrl(`/${L}`) },
      { "@type": "ListItem", position: 2, name: "Olivea Café Wine Bar", item: pageUrl },
    ],
  };

  return (
    <div>
      {/* React 19 hoists <script> into <head>.
          Hero image preload is emitted automatically by next/image with priority+fetchPriority. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />

      <FaqJsonLd id={faqId} items={faq} />

      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <CafeArticle lang={L} sections={cafeContent.sections as SectionData[]} />

      {/* The fallback is no longer a parallel MDX tree. lib/content/data is
          regenerated from the CMS at build time, so `sections` is populated
          even when Supabase is unreachable — the old MDX branch had become
          unreachable, while still carrying text that could contradict the
          live page. See scripts/generate-content-fallback.mjs. */}
      <Suspense
        fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
      >
        <CafeContent lang={L} sections={cafeContent.sections as SectionData[]} />
      </Suspense>
    </div>
  );
}
