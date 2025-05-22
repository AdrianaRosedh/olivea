// app/[lang]/casa/page.tsx
import type { Metadata, Viewport } from "next";
import { loadLocale } from "@/lib/i18n";
import CasaClientPage from "./CasaClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const { lang, dict } = await loadLocale(p);

  return {
    title: dict.casa.title,
    description: dict.casa.description,
    metadataBase: new URL("https://oliveafarmtotable.com"),
    openGraph: {
      title: dict.casa.title,
      description: dict.casa.description,
      images: [
        {
          url: "/images/casa.png",
          width: 1200,
          height: 630,
          alt: "Casa Olivea",
        },
      ],
      locale: lang,
      type: "website",
    },
    alternates: {
      canonical: `https://oliveafarmtotable.com/${lang}/casa`,
      languages: {
        en: `https://oliveafarmtotable.com/en/casa`,
        es: `https://oliveafarmtotable.com/es/casa`,
      },
    },

    // ← HERE: warm up the Casa identity clip
    other: {
      preload: [
        '<link rel="preload" href="/videos/casa.webm" as="video" type="video/webm" />',
        '<link rel="preload" href="/videos/casa.mp4"  as="video" type="video/mp4"  />',
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

export default async function CasaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const { dict } = await loadLocale(p);
  return <CasaClientPage dict={dict} />;
}