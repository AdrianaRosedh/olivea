// app/(main)/[lang]/farmtotable/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import {
  loadLocale as loadDict,
  type Lang,
} from "@/app/(main)/[lang]/dictionaries";
import { SITE } from "@/lib/site";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";

type FarmMetaShape = {
  farmtotable?: {
    meta?: { title?: string; description?: string; ogImage?: string };
  };
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

  const { lang: L, dict } = (await loadDict({
    lang: raw,
  })) as { lang: Lang; dict: FarmMetaShape };

  const isEs = L === "es";

  const fallbackTitle = "Olivea Farm To Table";

  const fallbackDescription = isEs
    ? "Restaurante de degustación con estrella Michelin, arraigado en un huerto vivo en Valle de Guadalupe, Baja California. Menú de temporada donde el huerto es la esencia."
    : "Michelin-starred tasting-menu restaurant rooted in a working garden in Valle de Guadalupe, Baja California. Seasonal menu where the garden is the essence.";

  const title = dict.farmtotable?.meta?.title ?? fallbackTitle;
  const description =
    dict.farmtotable?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.farmtotable?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/restaurant-og.jpg";

  const ogLocale = isEs ? "es_MX" : "en_US";
  const canonicalPath = `/${L}/farmtotable`;
  const url = `${SITE.baseUrl}${canonicalPath}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/en/farmtotable",
        es: "/es/farmtotable",
      },
    },
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale,
      type: "website",
      siteName: "OLIVEA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5e7658",
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const L: Lang = raw === "es" ? "es" : "en";
  const Content = L === "en" ? ContentEn : ContentEs;

  return (
    <div>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading…
          </div>
        }
      >
        <Content />
      </Suspense>
    </div>
  );
}