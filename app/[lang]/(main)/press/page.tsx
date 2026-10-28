// app/(main)/[lang]/press/page.tsx
import type { Metadata } from "next";
import PressClient from "./PressClient";
import ArticlePress from "./ArticlePress";
import { loadPressItems, loadPressManifest } from "./load";
import type { Lang } from "./pressTypes";
import { localeAlternates, withShare } from "@/lib/site";
import { getContent, t } from "@/lib/content";

async function pageMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";

  // Press's SEO fields in /admin (press_content.meta).
  const { meta } = await getContent("press");
  return {
    alternates: localeAlternates(lang, "/press"),
    title: t(lang, meta.title),
    description: t(lang, meta.description),
  };
}

export default async function PressPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";

  const items = await loadPressItems(lang);
  const manifest = loadPressManifest();
  const press = await getContent("press");

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <ArticlePress lang={lang} items={items} content={press} />
      <PressClient lang={lang} items={items} manifest={manifest} michelinBand={press.michelin_band} />
    </>
  );
}

export async function generateMetadata(
  props: Parameters<typeof pageMetadata>[0]
): Promise<Metadata> {
  const { lang } = await props.params;
  return withShare(await pageMetadata(props), { lang, path: "/press" });
}
