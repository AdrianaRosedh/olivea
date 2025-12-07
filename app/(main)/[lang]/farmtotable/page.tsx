// app/(main)/[lang]/farmtotable/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import {
  loadLocale as loadDict,
  type Lang,
} from "@/app/(main)/[lang]/dictionaries";
import ContentEs from "./ContentEs";
import ContentEn from "./ContentEn";

// just the bits we read for metadata
type FarmMetaShape = {
  farmtotable?: {
    meta?: { title?: string; description?: string; ogImage?: string };
  };
  metadata?: { ogDefault?: string };
};

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata(
  { params }: { params: { lang: string } }
): Promise<Metadata> {
  // Let the dict loader normalize "es" / "en"
  const { lang: L, dict } = (await loadDict({
    lang: params.lang,
  })) as { lang: Lang; dict: FarmMetaShape };

  const title =
    dict.farmtotable?.meta?.title ?? "Olivea Farm-to-Table — Restaurant";
  const description =
    dict.farmtotable?.meta?.description ??
    "Seasonal tasting menu from garden to table in Valle de Guadalupe.";
  const ogImage =
    dict.farmtotable?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/restaurant-og.jpg";

  const ogLocale = L === "es" ? "es_MX" : "en_US";

  return {
    title,
    description,
    metadataBase: new URL("https://oliveafarmtotable.com"),
    alternates: {
      canonical: `https://oliveafarmtotable.com/${L}/farmtotable`,
      languages: {
        en: "https://oliveafarmtotable.com/en/farmtotable",
        es: "https://oliveafarmtotable.com/es/farmtotable",
      },
    },
    openGraph: {
      title,
      description,
      locale: ogLocale,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#65735b",
};

export default async function Page({ params }: { params: { lang: string } }) {
  // 🔑 Content language comes directly from the URL segment
  const L: Lang = params.lang === "es" ? "es" : "en";
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