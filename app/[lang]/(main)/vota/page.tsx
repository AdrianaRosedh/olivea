// app/[lang]/(main)/vota/page.tsx
// MexBest 2026 Reader's Choice. Reachable without the locale prefix at
// /vota (see SHORT_URL_PREFIXES in proxy.ts) so it fits on a printed card.
//
// The whole screen lives in VoteClient: like the homepage, this is one fixed
// full-viewport composition that never scrolls, and LayoutShell drops its
// footer, docks and section nav for it (see isFullViewport there).
import type { Metadata, Viewport } from "next";
import type { Lang } from "../dictionaries";
import { localeAlternates, canonicalUrl, SITE } from "@/lib/site";
import { VOTE_COPY } from "./copy";
import VoteClient from "./VoteClient";
import "./vota.css";

export function generateStaticParams(): { lang: string }[] {
  return [{ lang: "es" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "en" ? "en" : "es";
  const copy = VOTE_COPY[lang];

  // A purpose-built share card so the link preview reads as the vote — not the
  // site's default food photo, which said nothing about Reader's Choice. One
  // per locale; absolute URL so scrapers (WhatsApp, etc.) can fetch it.
  const ogImage = canonicalUrl(lang === "en" ? "/images/seo/vota-og-en.jpg" : "/images/seo/vota-og.jpg");
  const ogTitle = `${copy.title} | OLIVEA`;

  return {
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: localeAlternates(lang, "/vota"),
    title: ogTitle,
    description: copy.lead,
    openGraph: {
      title: ogTitle,
      description: copy.lead,
      url: canonicalUrl(`/${lang}/vota`),
      siteName: "OLIVEA",
      locale: lang === "en" ? "en_US" : "es_MX",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: copy.lead,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5e7658",
  viewportFit: "cover",
};

export default async function VotePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = raw === "en" ? "en" : "es";
  const copy = VOTE_COPY[lang];

  return (
    <>
      {/* The visible page is a fixed overlay, so the readable copy that
          describes it lives here for crawlers and screen readers. */}
      <h1 className="sr-only">{copy.title}</h1>
      <p className="sr-only">{copy.lead}</p>

      <VoteClient copy={copy} />
    </>
  );
}
