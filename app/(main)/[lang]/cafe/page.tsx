// app/(main)/[lang]/cafe/page.tsx
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

  const { lang: L, dict } = (await loadDict({
    lang: raw,
  })) as { lang: Lang; dict: CafeMetaShape };

  const isEs = L === "es";

  const fallbackTitle = "OLIVEA Café";

  const fallbackDescription = isEs
    ? "Café de especialidad, pan de casa y desayunos junto al huerto de Olivea en Valle de Guadalupe, Baja California. Donde el huerto es la esencia."
    : "Specialty coffee, house bread and breakfast next to the Olivea garden in Valle de Guadalupe, Baja California. Where the garden is the essence.";

  const title = dict.cafe?.meta?.title ?? fallbackTitle;
  const description =
    dict.cafe?.meta?.description ?? fallbackDescription;

  const ogImage =
    dict.cafe?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/cafe-og.jpg";

  const ogLocale = isEs ? "es_MX" : "en_US";
  const canonicalPath = `/${L}/cafe`;
  const url = `${SITE.baseUrl}${canonicalPath}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/en/cafe",
        es: "/es/cafe",
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