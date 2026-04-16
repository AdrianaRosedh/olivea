// app/(home)/[lang]/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import HomeClient from "./HomeClient";
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";

  const title = isEs
    ? "OLIVEA | Hospitalidad del Huerto en Valle de Guadalupe, Baja California"
    : "OLIVEA | Farm Hospitality in Valle de Guadalupe, Baja California";

  const description = isEs
    ? "Hospitalidad del huerto en Valle de Guadalupe: restaurante de degustación con estrella MICHELIN, hospedaje y café nacidos del huerto en Baja California."
    : "Farm hospitality in Valle de Guadalupe: MICHELIN-starred tasting restaurant, farm stay, and café born from a working garden in Baja California.";

  const canonicalPath = isEs ? "/es" : "/en";

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en", es: "/es" },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl(canonicalPath),
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [
        {
          url: canonicalUrl("/images/og/cover.jpg"),
          width: 1200,
          height: 630,
          alt: "OLIVEA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl("/images/og/cover.jpg")],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const Article = lang === "en" ? ArticleEn : ArticleEs;

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />
      <HomeClient />
    </>
  );
}
