// app/(main)/[lang]/farmtotable/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/(main)/[lang]/dictionaries";
import { SITE, canonicalUrl } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";

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
    ? "Restaurante de menú degustación con reconocimiento MICHELIN, arraigado en un huerto vivo en Valle de Guadalupe, Baja California. Menú de temporada donde el huerto es la esencia."
    : "A MICHELIN-recognized tasting-menu restaurant rooted in a working garden in Valle de Guadalupe, Baja California. A seasonal menu where the garden is the essence.";

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
};

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";
  const Content = L === "en" ? ContentEn : ContentEs;

  const faq: FaqItem[] =
    L === "es"
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
            a: "Olivea is MICHELIN-recognized and has been featured by international publications. It’s a tasting-menu experience rooted in the garden and the territory of Baja California.",
          },
        ];

  const faqId = canonicalUrl(`/${L}/farmtotable#faq`);

  return (
    <div>
      <FaqJsonLd id={faqId} items={faq} />

      {/* Optional: invisible text (0 layout) */}
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
