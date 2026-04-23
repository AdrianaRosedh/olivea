// app/(home)/[lang]/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import { getContent, listContent, t } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
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
  const L = (lang === "es" ? "es" : "en") as Lang;
  const home = await getContent("home");

  const title = t(L, home.meta.title);
  const description = t(L, home.meta.description);
  const canonicalPath = L === "es" ? "/es" : "/en";

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
      locale: L === "es" ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [
        {
          url: canonicalUrl(home.meta.ogImage ?? "/images/og/cover.jpg"),
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
      images: [canonicalUrl(home.meta.ogImage ?? "/images/og/cover.jpg")],
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

  // Pass video config from content layer → client component as serializable props
  // Try hero_videos collection first (Supabase), fall back to home.video (static)
  const home = await getContent("home");
  const activeVideos = await listContent("heroVideos", { filter: { active: true }, limit: 1 });
  const video = activeVideos[0] ?? home.video;

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />
      <HomeClient
        videoConfig={video ? {
          version: video.version,
          mobile: video.mobile,
          desktop: video.desktop,
        } : undefined}
      />
    </>
  );
}
