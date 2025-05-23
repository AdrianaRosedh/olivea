// app/[lang]/cafe/page.tsx
import type { Metadata, Viewport } from "next";
import { loadLocale } from "@/lib/i18n";
import CafeClientPage from "./CafeClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const { lang, dict } = await loadLocale(p);

  return {
    title: dict.cafe.title,
    description: dict.cafe.description,
    metadataBase: new URL("https://www.oliveafarmtotable.com"),
    openGraph: {
      title: dict.cafe.title,
      description: dict.cafe.description,
      images: [
        {
          url: "/images/cafe.png",
          width: 1200,
          height: 630,
          alt: "Olivea Café",
        },
      ],
      locale: lang,
      type: "website",
    },
    alternates: {
      canonical: `https://www.oliveafarmtotable.com/${lang}/cafe`,
      languages: {
        en: `https://www.oliveafarmtotable.com/en/cafe`,
        es: `https://www.oliveafarmtotable.com/es/cafe`,
      },
    },

    // ← Add your video‐preload hints here:
    other: {
      preload: [
        // WebM first, then MP4
        '<link rel="preload" href="/videos/cafe.webm" as="video" type="video/webm" />',
        '<link rel="preload" href="/videos/cafe.mp4"  as="video" type="video/mp4"  />',
      ],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#65735b",
};

export default async function CafePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const { dict } = await loadLocale(p);
  return <CafeClientPage dict={dict} />;
}