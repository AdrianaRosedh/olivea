// app/(main)/[lang]/journal/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

import { getDictionary, type Lang } from "../../dictionaries";
import { listJournalSlugs, loadJournalBySlug, findTranslationSlug } from "@/lib/journal/load";
import { buildArticleJsonLd, buildJournalMetadata } from "@/lib/journal/seo";

type Params = { lang: string; slug: string };

export async function generateStaticParams() {
  const es = await listJournalSlugs("es");
  const en = await listJournalSlugs("en");
  return [
    ...es.map((slug) => ({ lang: "es", slug })),
    ...en.map((slug) => ({ lang: "en", slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang: Lang = rawLang === "es" ? "es" : "en";

  try {
    const post = await loadJournalBySlug(lang, slug);
    const otherLang = lang === "es" ? "en" : "es";
    const otherSlug = await findTranslationSlug(post.fm.translationId, otherLang);

    return buildJournalMetadata({
      fm: post.fm,
      otherLangSlug: otherSlug,
    });
  } catch {
    return { title: "Journal Post" };
  }
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang: Lang = rawLang === "es" ? "es" : "en";
  const dict = await getDictionary(lang);

  let post: Awaited<ReturnType<typeof loadJournalBySlug>>;
  try {
    post = await loadJournalBySlug(lang, slug);
  } catch {
    return notFound();
  }

  const otherLang = lang === "es" ? "en" : "es";
  const otherSlug = await findTranslationSlug(post.fm.translationId, otherLang);

  const jsonLd = buildArticleJsonLd({ fm: post.fm, readingMinutes: post.readingMinutes });

  return (
    <main className="p-10 max-w-2xl mx-auto">
      {post.fm.cover?.src && (
        <div className="relative w-full h-64 rounded-xl mb-6 overflow-hidden">
          <Image
            src={post.fm.cover.src}
            alt={post.fm.cover.alt || post.fm.title}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      )}

      <h1 className="text-3xl font-semibold mb-2">{post.fm.title}</h1>

      <p className="text-sm text-muted-foreground mb-6">
        {new Date(post.fm.publishedAt).toLocaleDateString()} — {post.readingMinutes} min
        {otherSlug ? (
          <>
            {" "}
            ·{" "}
            <a href={`/${otherLang}/journal/${otherSlug}`}>
              {lang === "es" ? "Read in English" : "Leer en Español"}
            </a>
          </>
        ) : null}
      </p>

      <article className="prose prose-neutral dark:prose-invert">{post.content}</article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* (optional) tiny footer hook for internal linking */}
      <div className="mt-10 text-sm opacity-70">
        {dict.journal?.backToJournal ? (
          <a className="underline underline-offset-4" href={`/${lang}/journal`}>
            {dict.journal.backToJournal}
          </a>
        ) : (
          <a className="underline underline-offset-4" href={`/${lang}/journal`}>
            Back to Journal
          </a>
        )}
      </div>
    </main>
  );
}