import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArticleReadTracker from "@/components/journal/ArticleReadTracker";

import { getDictionary, type Lang } from "../../dictionaries";
import {
  listJournalSlugs,
  loadJournalBySlug,
  findTranslationSlug,
} from "@/lib/journal/load";
import { buildArticleJsonLd, buildJournalMetadata } from "@/lib/journal/seo";
import { SITE } from "@/lib/site";

import ReadingProgress from "@/components/journal/ReadingProgress";
import ArticleAudioPlayer from "@/components/journal/ArticleAudioPlayer";
import ArticleDock from "@/components/journal/ArticleDock";
import type { TocItem } from "@/components/journal/ArticleTOC";
import { CoverLead, BodyLead } from "@/components/journal/JournalSlugEnter";

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

function formatDateEditorial(iso: string, lang: Lang) {
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

function safeAuthor(x: unknown): { id?: string; name?: string } {
  if (!x || typeof x !== "object") return {};
  const a = (x as Record<string, unknown>).author;
  if (!a) return {};

  if (typeof a === "string") return { name: a };

  if (typeof a === "object") {
    const o = a as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : undefined;
    const name = typeof o.name === "string" ? o.name : undefined;
    return { id, name };
  }

  return {};
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

  // ✅ Breadcrumbs JSON-LD (best practice)
  const journalPath = `/${lang}/journal`;
  const postPath = `/${lang}/journal/${slug}`;
  const journalUrl = `${SITE.baseUrl}${journalPath}`;
  const postUrl = `${SITE.baseUrl}${postPath}`;

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Olivea", item: SITE.baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: journalUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.fm.title,
        item: postUrl,
      },
    ],
  };

  const toc = safeToc(hasHeadings(post) ? post.headings : undefined);
  const audio = safeAudio(post.fm);
  const description = safeDescription(post.fm);

  const publishedLabel = formatDateEditorial(post.fm.publishedAt, lang);

  const a = safeAuthor(post.fm);
  const authorId = a.id;
  const authorName = a.name ?? (lang === "es" ? "Equipo Olivea" : "Olivea Editorial");

  const publishedPrefix = lang === "es" ? "Publicado el" : "Published on";

  return (
    <>
      <ReadingProgress />
      <ArticleReadTracker slug={slug} />

      <ArticleDock lang={lang} canonicalPath={postPath} toc={toc} />

      <main className="mx-auto w-full px-6 pb-16 pt-10 md:px-10">
        <div className="mx-auto w-full max-w-215 lg:pl-24">
          {/* Cover leads */}
          {post.fm.cover?.src ? (
            <CoverLead>
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
            </CoverLead>
          ) : null}

          {/* Title + meta follows */}
          <BodyLead>
            <header className="mb-8">
              <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                {post.fm.title}
              </h1>

              {/* Bigger editorial deck/subtitle */}
              {description ? (
                <>
                  <p
                    className={[
                      "mt-6 max-w-3xl text-pretty",
                      "text-[20px] md:text-[22px] lg:text-[23px]",
                      "leading-[1.6] md:leading-[1.55]",
                      "text-(--olivea-clay) opacity-95",
                    ].join(" ")}
                  >
                    {description}
                  </p>

                  <div className="mt-8 h-px w-24 bg-(--olivea-olive)/15" />
                </>
              ) : null}

              {/* Editorial byline */}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] md:text-[14px] text-(--olivea-olive) opacity-80">
                <span>
                  {lang === "es" ? "Por " : "By "}
                  {authorId ? (
                    <Link
                      href={`/${lang}/journal/author/${authorId}`}
                      className="font-medium underline underline-offset-4 hover:opacity-90"
                    >
                      {authorName}
                    </Link>
                  ) : (
                    <span className="font-medium underline underline-offset-4">
                      {authorName}
                    </span>
                  )}
                </span>

                <span className="opacity-50">•</span>

                <span>
                  {publishedPrefix}{" "}
                  <time dateTime={post.fm.publishedAt} className="font-medium">
                    {publishedLabel}
                  </time>
                </span>

                <span className="opacity-50">•</span>

                <span className="font-medium">{post.readingMinutes} min</span>

                {otherSlug ? (
                  <>
                    <span className="opacity-50">•</span>
                    <a
                      className="underline underline-offset-4 hover:opacity-90"
                      href={`/${otherLang}/journal/${otherSlug}`}
                    >
                      {lang === "es" ? "Leer en inglés" : "Read in Spanish"}
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

            {/* Editorial typography preset */}
            <article
              className={[
                "prose prose-neutral dark:prose-invert",
                "max-w-none",

                "prose-p:my-5",
                "prose-p:leading-[1.85]",
                "prose-p:text-(--olivea-clay)",

                "[&_h2]:uppercase",
                "[&_h2]:tracking-[0.12em] md:[&_h2]:tracking-[0.14em]",
                "[&_h2]:text-[13px] md:[&_h2]:text-[14px]",
                "[&_h2]:leading-[1.2]",
                "[&_h2]:font-medium",
                "[&_h2]:text-(--olivea-olive) [&_h2]:opacity-80",
                "[&_h2]:mt-14 [&_h2]:mb-3",

                "[&_h3]:uppercase",
                "[&_h3]:tracking-widest md:[&_h3]:tracking-[0.12em]",
                "[&_h3]:text-[12px] md:[&_h3]:text-[13px]",
                "[&_h3]:leading-[1.2]",
                "[&_h3]:font-medium",
                "[&_h3]:text-(--olivea-olive) [&_h3]:opacity-75",
                "[&_h3]:mt-10 [&_h3]:mb-2",

                "prose-hr:hidden",
                "[&_hr]:hidden",

                "prose-img:rounded-2xl",
                "prose-a:text-(--olivea-olive)",
                "prose-a:underline prose-a:underline-offset-4",
              ].join(" ")}
              style={{ fontSize: "calc(1rem * var(--journal-font-scale, 1))" }}
            >
              {post.content}
            </article>

            {/* ✅ Breadcrumbs + Article JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
            />
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
          </BodyLead>
        </div>
      </main>
    </>
  );
}