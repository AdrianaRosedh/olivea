// app/(home)/[lang]/metadata.ts
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: "es" | "en" };
}): Promise<Metadata> {
  const { lang } = params;

  return {
    title: lang === "es" ? "Grupo Olivea" : "Olivea Family",
    description: "Olivea Farm to Table – A garden experience for your senses",
    alternates: {
      canonical: `https://www.oliveafarmtotable.com/${lang}`,
      languages: {
        en: "https://www.oliveafarmtotable.com/en",
        es: "https://www.oliveafarmtotable.com/es",
      },
    },
    openGraph: {
      title: "Olivea Farm to Table",
      description: "Olivea Farm to Table – A garden experience for your senses",
      url: `https://www.oliveafarmtotable.com/${lang}`,
      locale: lang,
      siteName: "Grupo Olivea",
      images: [
        `/images/og-${lang}.jpg`,
        "/images/og-default.jpg",
      ],
    },
    other: {
      preload: [
        '<link rel="preload" href="/videos/homepage-temp.webm" as="video" type="video/webm" fetchpriority="high">',
        '<link rel="preload" href="/videos/homepage-temp.mp4" as="video" type="video/mp4" fetchpriority="high">'
      ],
    },
  };
}
