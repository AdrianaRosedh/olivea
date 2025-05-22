// app/(main)/[lang]/metadata.ts

import { loadLocale } from "@/lib/i18n";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: "es" | "en" };
}): Promise<Metadata> {
  const { lang, dict } = await loadLocale(params); // Wait for locale data

  return {
    title: { template: "%s | Olivea", default: "Familia Olivea" },
    description: dict.metadata?.description || "Default description", // Ensure there's a fallback for description
    openGraph: {
      title: "Olivea Farm To Table",
      description: dict.metadata?.description || "Default description",
      images: [`/images/og-${lang}.jpg`],
      url: `https://oliveafarmtotable.com/${lang}`,
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
