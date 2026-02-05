// app/(main)/[lang]/cafe/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale as loadDict, type Lang } from "@/app/(main)/[lang]/dictionaries";
import { SITE, canonicalUrl } from "@/lib/site";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";

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

  const title = dict.cafe?.meta?.title ?? fallbackTitle;
  const description = dict.cafe?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.cafe?.meta?.ogImage ?? dict.metadata?.ogDefault ?? "/images/seo/cafe-og.jpg";

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
            q: "¿Qué es Olivea Café?",
            a: "Un café de especialidad junto al huerto, con pan de casa, desayunos y una atmósfera serena en Valle de Guadalupe.",
          },
          {
            q: "¿Olivea Café está en Ensenada?",
            a: "Sí. Está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California.",
          },
        ]
      : [
          {
            q: "What is Olivea Café?",
            a: "A specialty coffee spot next to the garden, with house bread, breakfast, and a calm atmosphere in Valle de Guadalupe.",
          },
          {
            q: "Is Olivea Café in Ensenada?",
            a: "Yes. It’s located in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California.",
          },
        ];

  const faqId = canonicalUrl(`/${L}/cafe#faq`);

  return (
    <div>
      <FaqJsonLd id={faqId} items={faq} />

      <Suspense
        fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}
      >
        <Content />
      </Suspense>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-xl font-semibold">
          {L === "es" ? "Parte del ecosistema Olivea" : "Part of the Olivea ecosystem"}
        </h2>
        <p className="mt-4 text-sm leading-6 text-black/70">
          {L === "es"
            ? "Olivea Café forma parte del ecosistema Olivea en Valle de Guadalupe: café por la mañana, huerto vivo y la experiencia de Olivea Farm To Table y Casa Olivea en la misma propiedad."
            : "Olivea Café is part of the Olivea ecosystem in Valle de Guadalupe: morning coffee by the garden, plus Olivea Farm To Table and Casa Olivea on the same property."}
        </p>
      </section>
    </div>
  );
}
