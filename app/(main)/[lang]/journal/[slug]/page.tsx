import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import ArticleReadTracker from "@/components/journal/ArticleReadTracker";
import ReadingProgress from "@/components/journal/ReadingProgress";
import ArticleAudioPlayer from "@/components/journal/ArticleAudioPlayer";
import ArticleDock from "@/components/journal/ArticleDock";

import InlineImageReveal from "../InlineImageReveal";
import PhotoCarousel from "../PhotoCarousel";

import { getDictionary, type Lang } from "@/app/(main)/[lang]/dictionaries";
import {
  listJournalSlugs,
  loadJournalBySlug,
  findTranslationSlug,
} from "@/lib/journal/load";
import {
  buildArticleJsonLd,
  buildJournalMetadata,
  buildItemListJsonLd,
  buildFaqJsonLd,
} from "@/lib/journal/seo";
import { SITE } from "@/lib/site";

import type { TocItem } from "@/components/journal/ArticleTOC";
import { CoverLead, BodyLead } from "@/components/journal/JournalSlugEnter";
import { normalizeAuthor } from "@/lib/journal/author";

/* ---------------- types ---------------- */

type Params = { lang: string; slug: string };
type GalleryImage = { src: string; alt: string };

/* ---------------- static params ---------------- */

export async function generateStaticParams() {
  const es = await listJournalSlugs("es");
  const en = await listJournalSlugs("en");
  return [
    ...es.map((slug) => ({ lang: "es", slug })),
    ...en.map((slug) => ({ lang: "en", slug })),
  ];
}

/* ---------------- metadata ---------------- */

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

/* ---------------- helpers ---------------- */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function hasHeadings(x: unknown): x is { headings: unknown } {
  return isRecord(x) && "headings" in x;
}

function safeToc(x: unknown): TocItem[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter(isRecord)
    .map((o) => ({
      id: typeof o.id === "string" ? o.id : "",
      title: typeof o.title === "string" ? o.title : "",
      level: typeof o.level === "number" ? o.level : 2,
    }))
    .filter((h) => h.id && h.title);
}

type AudioChapter = { t: number; label: string };
type AudioMeta = { src: string; chapters?: AudioChapter[] };

function safeAudio(x: unknown): AudioMeta | null {
  if (!isRecord(x)) return null;
  const audio = x.audio;
  if (!isRecord(audio)) return null;

  const src = typeof audio.src === "string" ? audio.src : "";
  if (!src) return null;

  const chaptersRaw = audio.chapters;
  if (!Array.isArray(chaptersRaw)) return { src };

  const chapters: AudioChapter[] = [];
  for (const ch of chaptersRaw) {
    if (!isRecord(ch)) continue;
    if (typeof ch.t === "number" && typeof ch.label === "string") {
      chapters.push({ t: ch.t, label: ch.label });
    }
  }

  return chapters.length ? { src, chapters } : { src };
}

function safeGallery(x: unknown): GalleryImage[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter(isRecord)
    .map((i) => ({
      src: typeof i.src === "string" ? i.src : "",
      alt: typeof i.alt === "string" ? i.alt : "",
    }))
    .filter((i) => i.src && i.alt);
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

/* ---------------- page ---------------- */

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

  const toc = safeToc(hasHeadings(post) ? post.headings : undefined);
  const audio = safeAudio(post.fm);
  const gallery = safeGallery(post.fm.gallery);

  const publishedLabel = formatDateEditorial(post.fm.publishedAt, lang);
  const publishedPrefix = lang === "es" ? "Publicado el" : "Published on";

  const author = normalizeAuthor(post.fm.author, lang);

  /* ---------- SEO JSON-LD ---------- */

  const jsonLd = buildArticleJsonLd({
    fm: post.fm,
    readingMinutes: post.readingMinutes,
  });

  const itemListLd = buildItemListJsonLd(post.fm);
  const faqLd = buildFaqJsonLd(post.fm);

  const journalPath = `/${lang}/journal`;
  const postPath = `/${lang}/journal/${slug}`;

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Olivea", item: SITE.baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: `${SITE.baseUrl}${journalPath}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.fm.title,
        item: `${SITE.baseUrl}${postPath}`,
      },
    ],
  };

  return (
    <>
      <ReadingProgress />
      <ArticleReadTracker slug={slug} />
      <ArticleDock lang={lang} canonicalPath={postPath} toc={toc} />

      {/* client-only scroll reveal */}
      <InlineImageReveal />

      <main className="mx-auto w-full px-6 pb-16 pt-10 md:px-10">
        <div className="mx-auto w-full max-w-215 lg:pl-24">
          {post.fm.cover?.src && (
            <CoverLead>
              <div className="relative mb-8 h-[38vh] min-h-60 overflow-hidden rounded-3xl">
                <Image
                  src={post.fm.cover.src}
                  alt={post.fm.cover.alt || post.fm.title}
                  fill
                  priority
                  style={{ objectFit: "cover" }}
                />
              </div>
            </CoverLead>
          )}

          <BodyLead>
            <header className="mb-8">
              <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                {post.fm.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] md:text-[14px] text-(--olivea-olive) opacity-80">
                <span>
                  {lang === "es" ? "Por " : "By "}
                  <Link
                    href={`/${lang}/journal/author/${author.id}`}
                    className="font-medium underline underline-offset-4 hover:opacity-90"
                  >
                    {author.name}
                  </Link>
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

                {otherSlug && (
                  <>
                    <span className="opacity-50">•</span>
                    <Link
                      href={`/${otherLang}/journal/${otherSlug}`}
                      className="underline underline-offset-4 hover:opacity-90"
                    >
                      {lang === "es" ? "Leer en inglés" : "Read in Spanish"}
                    </Link>
                  </>
                )}
              </div>

              {audio && (
                <div className="mt-6">
                  <ArticleAudioPlayer
                    title={post.fm.title}
                    src={audio.src}
                    chapters={audio.chapters}
                  />
                </div>
              )}
            </header>

            <article
              className={[
                "prose prose-neutral dark:prose-invert",
                "max-w-none",
              
                /* Paragraph rhythm */
                "prose-p:my-5",
                "prose-p:leading-[1.85]",
                "prose-p:text-(--olivea-clay)",
              
                /* ---------------- INLINE IMAGE SYSTEM ---------------- */
              
                /* Base figure box (square, small) */
                "[&_figure]:relative",
                "[&_figure]:w-60",
                "[&_figure]:h-60",
                "[&_figure]:overflow-hidden",
                "[&_figure]:rounded-2xl",
              
                /* Mobile spacing */
                "[&_figure]:mt-6",
                "[&_figure]:mb-6",

                /* Desktop spacing */
                "md:[&_figure]:mt-12",
                "md:[&_figure]:mb-12",

              
                /* Image fills square */
                "[&_figure_img]:w-full",
                "[&_figure_img]:h-full",
                "[&_figure_img]:object-cover",
              
                /* Scroll reveal animation */
                "[&_figure]:opacity-0",
                "[&_figure]:translate-y-4",
                "[&_figure]:transition-all",
                "[&_figure]:duration-700",
                "[&_figure]:ease-out",
                "[&_figure.is-visible]:opacity-100",
                "[&_figure.is-visible]:translate-y-0",
              
                /* ---------------- DESKTOP WRAP ---------------- */
                "md:[&_figure.float-left]:float-left",
                "md:[&_figure.float-left]:mr-6",
              
                "md:[&_figure.float-right]:float-right",
                "md:[&_figure.float-right]:ml-6",
              
                /* ---------------- MOBILE BEHAVIOR ---------------- */
                "[&_figure]:float-none",
                "[&_figure]:mx-auto",
                "[&_figure]:clear-both",
              
                /* Links */
                "prose-a:text-(--olivea-olive)",
                "prose-a:underline prose-a:underline-offset-4",
              ].join(" ")}
            >
              {post.content}
            </article>
            
            
            {gallery.length > 0 && <PhotoCarousel images={gallery} />}

            {/* JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {itemListLd && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
              />
            )}
            {faqLd && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
              />
            )}

            <div className="mt-12 text-sm opacity-70">
              <Link
                href={`/${lang}/journal`}
                className="underline underline-offset-4 hover:opacity-90"
              >
                {dict.journal?.backToJournal ?? "Back to Journal"}
              </Link>
            </div>
          </BodyLead>
        </div>
      </main>
    </>
  );
}