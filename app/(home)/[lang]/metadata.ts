// app/(home)/[lang]/metadata.ts

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: "es" | "en" };
}): Promise<Metadata> {
  const lang = params.lang;  // You can use a default or fetch locale-specific metadata if needed

  return {
    title: { template: "%s | Olivea", default: "Familia Olivea" },
    description: "Olivea Farm to Table - A garden experience for your senses", // You can customize this per language
    openGraph: {
      title: "Olivea Farm To Table",
      description: "Olivea Farm to Table - A garden experience for your senses",
      images: [`/images/og-${lang}.jpg`],  // Dynamic OG image depending on language
      url: `https://oliveafarmtotable.com/${lang}`,  // Dynamic URL
      locale: lang,
      siteName: "Familia Olivea",
    },
    alternates: {
      canonical: `https://oliveafarmtotable.com/${lang}`,
      languages: {
        en: `https://oliveafarmtotable.com/en`,
        es: `https://oliveafarmtotable.com/es`,
      },
    },
  };
}
