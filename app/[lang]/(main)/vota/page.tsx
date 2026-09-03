// app/[lang]/(main)/vota/page.tsx
// MexBest 2026 Reader's Choice. Reachable without the locale prefix at
// /vota (see SHORT_URL_PREFIXES in proxy.ts) so it fits on a printed card.
//
// The whole screen lives in VoteClient: like the homepage, this is one fixed
// full-viewport composition that never scrolls, and LayoutShell drops its
// footer, docks and section nav for it (see isFullViewport there).
import type { Metadata, Viewport } from "next";
import type { Lang } from "../dictionaries";
import { localeAlternates } from "@/lib/site";
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

  return {
    alternates: localeAlternates(lang, "/vota"),
    title: `${copy.title} | OLIVEA`,
    description: copy.lead,
    openGraph: { title: `${copy.title} | OLIVEA`, description: copy.lead },
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
