// app/(main)/[lang]/casa/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import {
  loadLocale as loadDict,
  type Lang,
} from "@/app/(main)/[lang]/dictionaries";
import { SITE } from "@/lib/site";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";

// minimal shape for what we read from the dict
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

  const { lang: L, dict } = (await loadDict({
    lang: raw,
  })) as { lang: Lang; dict: CasaMetaShape };

  const isEs = L === "es";

  const fallbackTitle = isEs
    ? "Casa Olivea — hotel boutique en Valle de Guadalupe"
    : "Casa Olivea — boutique hotel in Valle de Guadalupe";

  const fallbackDescription = isEs
    ? "Hotel boutique integrado al huerto y al restaurante Olivea Farm To Table en Valle de Guadalupe, Baja California. Donde el huerto es la esencia."
    : "Boutique hotel integrated with the garden and Olivea Farm To Table restaurant in Valle de Guadalupe, Baja California. Where the garden is the essence.";

  const title = dict.casa?.meta?.title ?? fallbackTitle;
  const description =
    dict.casa?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.casa?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/casa-og.jpg";

  const ogLocale = isEs ? "es_MX" : "en_US";
  const canonicalPath = `/${L}/casa`;
  const url = `${SITE.baseUrl}${canonicalPath}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/en/casa",
        es: "/es/casa",
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