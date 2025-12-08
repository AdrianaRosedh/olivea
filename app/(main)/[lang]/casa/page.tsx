// app/(main)/[lang]/casa/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import {
  loadLocale as loadDict,
  type Lang,
} from "@/app/(main)/[lang]/dictionaries";
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

  const title = dict.casa?.meta?.title ?? "Casa OLIVEA — Hotel";
  const description =
    dict.casa?.meta?.description ??
    "Rooms, design, and calm at Casa OLIVEA.";
  const ogImage =
    dict.casa?.meta?.ogImage ??
    dict.metadata?.ogDefault ??
    "/images/seo/casa-og.jpg";

  const ogLocale = L === "es" ? "es_MX" : "en_US";

  return {
    title,
    description,
    metadataBase: new URL("https://oliveafarmtotable.com"),
    alternates: {
      canonical: `https://oliveafarmtotable.com/${L}/casa`,
      languages: {
        en: "https://oliveafarmtotable.com/en/casa",
        es: "https://oliveafarmtotable.com/es/casa",
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