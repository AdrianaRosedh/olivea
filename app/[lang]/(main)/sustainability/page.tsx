// app/(main)/[lang]/sustainability/page.tsx
import type { Metadata } from "next";
import PhilosophyClient from "./PhilosophyClient";
import PhilosophyArticle from "./PhilosophyArticle";
import { toFaqItems } from "@/lib/seo/faq";
import { loadPhilosophySectionsCms } from "./load";
import { philosophyFaqLd } from "./faq";
import { canonicalUrl, withShare } from "@/lib/site";
import type { Lang } from "./philosophyTypes";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import { getContent, t } from "@/lib/content";

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

async function pageMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";

  // The Philosophy record's SEO fields in /admin (sustainability_content.meta).
  // They lead with the name because that is what people actually ask — an
  // assistant asked "why is it called Olivea?" answered by guessing at olive
  // trees until the title and description matched the question.
  const { meta } = await getContent("sustainability");
  const title = t(lang, meta.title);
  const description = t(lang, meta.description);

  const path = `/${lang}/sustainability`;
  const canonical = canonicalUrl(path);

  return {
    title,
    description,

    // ✅ Make indexing unambiguous
    robots: { index: true, follow: true },

    // ✅ Canonical + hreflang (prevents split signals)
    alternates: {
      canonical,
      languages: {
        es: canonicalUrl("/es/sustainability"),
        en: canonicalUrl("/en/sustainability"),
      },
    },

    openGraph: {
      type: "website",
      url: canonical,
      siteName: "OLIVEA",
      title,
      description,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";
  const [sections, content] = await Promise.all([
    loadPhilosophySectionsCms(lang),
    getContent("sustainability"),
  ]);
  // Questions from /admin → Philosophy: the article and the FAQPage markup
  // carry the same text.
  const faq = toFaqItems(content.faq, lang);
  const faqLd = philosophyFaqLd(lang, canonicalUrl(`/${lang}/sustainability`), faq);

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients, built from the
          same CMS chapters as the page.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <PhilosophyArticle lang={lang} content={content} sections={sections} faq={faq} />
      <PhilosophyClient lang={lang} sections={sections} />

      {/* Assistants answer from whatever they can retrieve and attribute. The
          page already explained the name; this states the question alongside
          the answer so the page can be found by someone asking it. React 19
          hoists ld+json into <head>. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }}
      />
    </>
  );
}

export async function generateMetadata(
  props: Parameters<typeof pageMetadata>[0]
): Promise<Metadata> {
  const { lang } = await props.params;
  return withShare(await pageMetadata(props), { lang, path: "/sustainability" });
}
