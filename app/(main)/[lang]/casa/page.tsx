// app/(main)/[lang]/casa/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/(main)/[lang]/dictionaries";
import { SITE, canonicalUrl } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";

type CasaMetaShape = {
  casa?: { meta?: { title?: string; description?: string; ogImage?: string } };
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
    dict: CasaMetaShape;
  };

  const isEs = L === "es";

  const fallbackTitle = "Casa OLIVEA";
  const fallbackDescription = isEs
    ? "Hotel boutique integrado al huerto y al restaurante Olivea Farm To Table en Valle de Guadalupe, Baja California. Donde el huerto es la esencia."
    : "A boutique hotel integrated with the garden and Olivea Farm To Table in Valle de Guadalupe, Baja California. Where the garden is the essence.";

  const title = dict.casa?.meta?.title ?? fallbackTitle;
  const description = dict.casa?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.casa?.meta?.ogImage ?? dict.metadata?.ogDefault ?? "/images/seo/casa-og.jpg";

  const canonicalPath = `/${L}/casa`;
  const url = canonicalUrl(canonicalPath);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en/casa", es: "/es/casa" },
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
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";
  const Content = L === "en" ? ContentEn : ContentEs;

  const faq: FaqItem[] =
    L === "es"
      ? [
          {
            q: "¿Por qué hospedarse en Casa Olivea en Valle de Guadalupe?",
            a: "Casa Olivea es un hotel boutique tranquilo integrado al huerto y conectado a Olivea Farm To Table, ideal para una experiencia de hospedaje y gastronomía en el mismo lugar.",
          },
          {
            q: "¿Casa Olivea está en Valle de Guadalupe o Ensenada?",
            a: "Casa Olivea está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California.",
          },
          {
            q: "¿Puedo cenar en Olivea Farm To Table si me hospedo en Casa Olivea?",
            a: "Sí. Recomendamos reservar con anticipación. La experiencia está diseñada para disfrutar hospedaje y cena en la misma propiedad.",
          },
        ]
      : [
          {
            q: "Why stay at Casa Olivea in Valle de Guadalupe?",
            a: "Casa Olivea is a calm boutique hotel integrated with the garden and connected to Olivea Farm To Table—ideal for a stay-and-dine experience on the same property.",
          },
          {
            q: "Is Casa Olivea in Valle de Guadalupe or Ensenada?",
            a: "Casa Olivea is located in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California.",
          },
          {
            q: "Can I dine at Olivea Farm To Table if I stay at Casa Olivea?",
            a: "Yes. We recommend booking in advance. The experience is designed for guests to enjoy dining and staying in one place.",
          },
        ];

  const faqId = canonicalUrl(`/${L}/casa#faq`);

  return (
    <div>
      {/* ✅ AI/SEO only: structured FAQ */}
      <FaqJsonLd id={faqId} items={faq} />

      {/* Optional: keep invisible text for accessibility/crawlers (0 layout) */}
      <div className="sr-only">
        <h2>{L === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}</h2>
        {faq.map((it) => (
          <div key={it.q}>
            <h3>{it.q}</h3>
            <p>{it.a}</p>
          </div>
        ))}
      </div>

      <Suspense
        fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}
      >
        <Content />
      </Suspense>
    </div>
  );
}
