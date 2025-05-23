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
      canonical: `https://wwww.oliveafarmtotable.com/${lang}`,
      languages: {
        en: "https://wwww.oliveafarmtotable.com/en",
        es: "https://wwww.oliveafarmtotable.com/es",
      },
    },
    openGraph: {
      title: lang === "es" ? "Olivea Farm to Table" : "Olivea Farm to Table",
      description: "Olivea Farm to Table – A garden experience for your senses",
      url: `https://wwww.oliveafarmtotable.com/${lang}`,
      locale: lang,
      siteName: "Grupo Olivea",
      images: [
        `/images/og-${lang}.jpg`,
        "/images/og-default.jpg", // fallback
      ],
    },
  };
}
