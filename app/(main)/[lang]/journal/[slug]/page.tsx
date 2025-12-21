// app/(main)/[lang]/journal/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

import { getDictionary, type Lang } from "../../dictionaries";
import {
  listJournalSlugs,
  loadJournalBySlug,
  findTranslationSlug,
} from "@/lib/journal/load";
import { buildArticleJsonLd, buildJournalMetadata } from "@/lib/journal/seo";

import ReadingProgress from "@/components/journal/ReadingProgress";
import ArticleAudioPlayer from "@/components/journal/ArticleAudioPlayer";
import ArticleDock from "@/components/journal/ArticleDock";
import type { TocItem } from "@/components/journal/ArticleTOC";

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

function formatDate(iso: string, lang: Lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Accept `post.headings` if it exists (wire in later). */
function safeToc(x: unknown): TocItem[] {
  if (!Array.isArray(x)) return [];
  const out: TocItem[] = [];
  for (const item of x) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "";
    const title = typeof o.title === "string" ? o.title : "";
    const level = typeof o.level === "number" ? o.level : 2;
    if (id && title) out.push({ id, title, level });
  }
  return out;
}

/* ---------- helpers to avoid `any` ---------- */

type AudioChapter = { t: number; label: string };
type AudioMeta = { src: string; chapters?: AudioChapter[] };

function hasHeadings(x: unknown): x is { headings?: unknown } {
  return !!x && typeof x === "object";
}

function safeAudio(x: unknown): AudioMeta | null {
  if (!x || typeof x !== "object") return null;

  const audio = (x as Record<string, unknown>).audio;
  if (!audio || typeof audio !== "object") return null;

  const a = audio as Record<string, unknown>;
  const src = typeof a.src === "string" ? a.src : "";
  if (!src) return null;

  const chaptersRaw = a.chapters;
  let chapters: AudioChapter[] | undefined;

  if (Array.isArray(chaptersRaw)) {
    const parsed: AudioChapter[] = [];
    for (const ch of chaptersRaw) {
      if (!ch || typeof ch !== "object") continue;
      const o = ch as Record<string, unknown>;
      const t = typeof o.t === "number" ? o.t : NaN;
      const label = typeof o.label === "string" ? o.label : "";
      if (Number.isFinite(t) && label) parsed.push({ t, label });
    }
    if (parsed.length) chapters = parsed.sort((a, b) => a.t - b.t);
  }

  return { src, chapters };
}

function safeDescription(x: unknown): string | undefined {
  if (!x || typeof x !== "object") return undefined;
  const d = (x as Record<string, unknown>).description;
  return typeof d === "string" ? d : undefined;
}

/* ---------- page ---------- */

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

  const jsonLd = buildArticleJsonLd({
    fm: post.fm,
    readingMinutes: post.readingMinutes,
  });

  const toc = safeToc(hasHeadings(post) ? post.headings : undefined);
  const audio = safeAudio(post.fm);
  const description = safeDescription(post.fm);

  const publishedLabel = formatDate(post.fm.publishedAt, lang);
  const minutesLeft = Math.max(1, post.readingMinutes);

  return (
    <>
      {/* top progress bar */}
      <ReadingProgress />

      {/* DockLeft (desktop) + second navbar (mobile) */}
      <ArticleDock
        lang={lang}
        canonicalPath={`/${lang}/journal/${slug}`}
        toc={toc}
      />

      <main className="mx-auto w-full px-6 pb-16 pt-10 md:px-10">
        {/* center article + leave room for DockLeft on desktop */}
        <div className="mx-auto w-full max-w-215 lg:pl-24">
          {post.fm.cover?.src ? (
            <div className="relative mb-8 h-[38vh] min-h-60 w-full overflow-hidden rounded-3xl">
              <Image
                src={post.fm.cover.src}
                alt={post.fm.cover.alt || post.fm.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 860px"
                style={{ objectFit: "cover" }}
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-black/0 to-black/0" />
            </div>
          ) : null}

          <header className="mb-8">
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              {post.fm.title}
            </h1>

            {description ? (
              <p className="mt-3 max-w-2xl text-pretty text-lg opacity-80">
                {description}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm opacity-75">
              <time dateTime={post.fm.publishedAt}>{publishedLabel}</time>
              <span aria-hidden>—</span>
              <span>{post.readingMinutes} min</span>
              <span aria-hidden>·</span>
              <span>
                {lang === "es" ? "Aprox." : "Approx."} {minutesLeft}{" "}
                {lang === "es" ? "min restantes" : "min left"}
              </span>

              {otherSlug ? (
                <>
                  <span aria-hidden>·</span>
                  <a
                    className="underline underline-offset-4 hover:opacity-90"
                    href={`/${otherLang}/journal/${otherSlug}`}
                  >
                    {lang === "es" ? "Read in English" : "Leer en Español"}
                  </a>
                </>
              ) : null}
            </div>

            {audio ? (
              <div className="mt-6">
                <ArticleAudioPlayer
                  title={post.fm.title}
                  src={audio.src}
                  chapters={audio.chapters}
                />
              </div>
            ) : null}
          </header>

          <article
            className={[
              "prose prose-neutral dark:prose-invert",
              "prose-headings:scroll-mt-28",
              "prose-img:rounded-2xl",
              "prose-a:underline prose-a:underline-offset-4",
              "max-w-none",
            ].join(" ")}
            style={{ fontSize: "calc(1rem * var(--journal-font-scale, 1))" }}
          >
            {post.content}
          </article>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <div className="mt-12 text-sm opacity-70">
            <a
              className="underline underline-offset-4 hover:opacity-90"
              href={`/${lang}/journal`}
            >
              {dict.journal?.backToJournal ?? "Back to Journal"}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}