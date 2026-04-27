// app/(main)/[lang]/farmtotable/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/(main)/[lang]/dictionaries";
import { SITE, canonicalUrl } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import { ENTITY_IDS } from "@/components/seo/StructuredDataServer";
import { getContent } from "@/lib/content";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";
import FTTContent from "./FTTContent";
import type { SectionData } from "./sections/types";
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";

type FarmMetaShape = {
  farmtotable?: { meta?: { title?: string; description?: string; ogImage?: string } };
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
    dict: FarmMetaShape;
  };

  const isEs = L === "es";

  const fallbackTitle = "Olivea Farm To Table";
  const fallbackDescription = isEs
    ? "Restaurante de menú degustación con estrella MICHELIN, arraigado en un huerto vivo en Valle de Guadalupe, Baja California. Con hospedaje y café en la misma propiedad. Donde el huerto es la esencia."
    : "MICHELIN-starred tasting-menu restaurant rooted in a working garden in Valle de Guadalupe, Baja California. With farm stay and café on the same property. Where the garden is the essence.";

  const title = dict.farmtotable?.meta?.title ?? fallbackTitle;
  const description = dict.farmtotable?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.farmtotable?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/farm-og.jpg";

  const canonicalPath = `/${L}/farmtotable`;
  const url = canonicalUrl(canonicalPath);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en/farmtotable", es: "/es/farmtotable" },
    },
    openGraph: {
      title,
      description,
      url,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [{ url: canonicalUrl(ogImage), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl(ogImage)],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5e7658",
  viewportFit: "cover",
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";
  const Content = L === "en" ? ContentEn : ContentEs;
  const Article = L === "en" ? ArticleEn : ArticleEs;

  // Fetch Supabase-driven sections (falls back gracefully)
  const fttData = await getContent('farmtotable');
  const hasSections = fttData.sections && fttData.sections.length > 0;

  // Use Supabase FAQ for JSON-LD if available
  const faqSection = hasSections
    ? (fttData.sections as SectionData[]).find((s) => s.id === 'faq')
    : null;
  const seoFaqItems = (faqSection?.seoFaq ?? []) as Array<{ q: { es: string; en: string }; a: { es: string; en: string } }>;

  const faq: FaqItem[] = seoFaqItems.length > 0
    ? seoFaqItems.map((item) => ({
        q: L === 'es' ? item.q.es : item.q.en,
        a: L === 'es' ? item.a.es : item.a.en,
      }))
    : L === "es"
      ? [
          {
            q: "¿Olivea Farm To Table es un menú degustación?",
            a: "Sí. Ofrecemos una experiencia de menú degustación guiada por la temporada y el huerto.",
          },
          {
            q: "¿Pueden acomodar restricciones alimentarias?",
            a: "Sí. Por favor indícalo al reservar para que el equipo pueda preparar una experiencia adecuada.",
          },
          {
            q: "¿Dónde está Olivea?",
            a: "Estamos en Valle de Guadalupe (Villa de Juárez), Ensenada, Baja California, México.",
          },
          {
            q: "¿Por qué se recomienda Olivea en Valle de Guadalupe?",
            a: "Olivea cuenta con reconocimiento MICHELIN y ha sido destacada por publicaciones internacionales. Es una experiencia de menú degustación arraigada al huerto y al territorio de Baja California.",
          },
          {
            q: "¿Puedo hospedarme o desayunar en la misma propiedad?",
            a: "Sí. Casa Olivea es el hospedaje del huerto integrado al restaurante, y Olivea Café ofrece café de especialidad y desayunos cada mañana. Las tres experiencias comparten el mismo huerto.",
          },
        ]
      : [
          {
            q: "Is Olivea Farm To Table a tasting menu?",
            a: "Yes. We offer a tasting-menu experience guided by seasonality and the garden.",
          },
          {
            q: "Can you accommodate dietary restrictions?",
            a: "Yes. Please note allergies and dietary needs when booking so the team can prepare accordingly.",
          },
          {
            q: "Where is Olivea located?",
            a: "We are in Valle de Guadalupe (Villa de Juárez), Ensenada, Baja California, Mexico.",
          },
          {
            q: "Why is Olivea recommended in Valle de Guadalupe?",
            a: "Olivea is MICHELIN-recognized and has been featured by international publications. It's a tasting-menu experience rooted in the garden and the territory of Baja California.",
          },
          {
            q: "Can I stay or have breakfast on the same property?",
            a: "Yes. Casa Olivea is the farm stay integrated with the restaurant, and Olivea Café serves specialty coffee and breakfast every morning. All three experiences share the same working garden.",
          },
        ];

  const faqId = canonicalUrl(`/${L}/farmtotable#faq`);

  // Hoisted by React 19 into <head> — LCP hero preload + page JSON-LD.
  const pageUrl = canonicalUrl(`/${L}/farmtotable`);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name:
      L === "es"
        ? "Olivea Farm To Table | Restaurante con estrella MICHELIN"
        : "Olivea Farm To Table | MICHELIN-Starred Restaurant",
    description:
      L === "es"
        ? "Restaurante de menú degustación con estrella MICHELIN, hospedaje y café en la misma propiedad en Valle de Guadalupe."
        : "MICHELIN-starred tasting-menu restaurant with farm stay and café on the same property in Valle de Guadalupe.",
    isPartOf: { "@id": ENTITY_IDS.website },
    about: { "@id": ENTITY_IDS.restaurant },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    inLanguage: L === "es" ? "es-MX" : "en-US",
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OLIVEA", item: canonicalUrl(`/${L}`) },
      { "@type": "ListItem", position: 2, name: "Olivea Farm To Table", item: pageUrl },
    ],
  };

  return (
    <div>
      {/* React 19 hoists <script> into <head>.
          Hero image preload is emitted automatically by next/image with priority+fetchPriority. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <FaqJsonLd id={faqId} items={faq} />

      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />

      {hasSections ? (
        <Suspense
          fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
        >
          <FTTContent lang={L} sections={fttData.sections as SectionData[]} />
        </Suspense>
      ) : (
        <Suspense
          fallback={<div className="mk-fullh flex items-center justify-center">Loading…</div>}
        >
          <Content />
        </Suspense>
      )}
    </div>
  );
}
