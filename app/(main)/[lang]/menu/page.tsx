// app/(main)/[lang]/menu/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import { type Lang } from "@/lib/i18n";
import MenuDeepLinkClient from "./MenuDeepLinkClient";

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "en" ? "en" : "es";
  const isEs = lang === "es";

  const title = isEs ? "Menú | OLIVEA" : "Menu | OLIVEA";
  const description = isEs
    ? "Menú de temporada de Olivea Farm To Table y Olivea Café — cocina arraigada al huerto en Valle de Guadalupe."
    : "Seasonal menu for Olivea Farm To Table and Olivea Café — garden-rooted cuisine in Valle de Guadalupe.";

  const path = `/${lang}/menu`;
  const url = canonicalUrl(path);

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: url,
      languages: { es: canonicalUrl("/es/menu"), en: canonicalUrl("/en/menu") },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
    },
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <MenuDeepLinkClient lang={lang} />;
}
