import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

import type { Lang } from "@/app/(main)/[lang]/dictionaries";
import { listJournalIndex } from "@/lib/journal/load";

/* ---------------- helpers ---------------- */

function extractAuthor(fm: unknown): { id?: string; name?: string } {
  if (!fm || typeof fm !== "object") return {};
  const a = (fm as Record<string, unknown>).author;

  if (typeof a === "string") return { name: a };
  if (a && typeof a === "object") {
    const o = a as Record<string, unknown>;
    return {
      id: typeof o.id === "string" ? o.id : undefined,
      name: typeof o.name === "string" ? o.name : undefined,
    };
  }
  return {};
}

function fmtDate(iso: string, lang: Lang) {
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

/* ---------------- metadata ---------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang: Lang = p.lang === "es" ? "es" : "en";

  return {
    title:
      lang === "es"
        ? "Autor | Journal de Olivea"
        : "Author | Olivea Journal",
    robots: { index: true, follow: true },
  };
}

/* ---------------- page ---------------- */

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const p = await params;
  const lang: Lang = p.lang === "es" ? "es" : "en";
  const authorId = p.id;

  const items = await listJournalIndex(lang);

  const byAuthor = items.filter((it) => {
    const a = extractAuthor(it);
    return a.id === authorId;
  });

  if (byAuthor.length === 0) return notFound();

  const displayName =
    extractAuthor(byAuthor[0]).name ?? authorId.replace(/-/g, " ");

  return (
    <main className="mx-auto w-full max-w-215 px-6 pb-20 pt-12 md:px-10">
      {/* ---------- Header ---------- */}
      <header className="mb-12">
        <div className="text-[12px] uppercase tracking-[0.32em] text-(--olivea-olive) opacity-70">
          {lang === "es" ? "Autor" : "Author"}
        </div>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-(--olivea-olive) md:text-5xl">
          {displayName}
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-(--olivea-clay) opacity-90">
          {lang === "es"
            ? "Artículos publicados en el Journal de Olivea."
            : "Articles published in Olivea’s Journal."}
        </p>

        {/* back to journal (editorial, subtle) */}
        <Link
          href={`/${lang}/journal`}
          className="mt-6 inline-block text-[13px] underline underline-offset-4 text-(--olivea-olive) opacity-80 hover:opacity-100"
        >
          {lang === "es" ? "Volver al Journal" : "Back to Journal"}
        </Link>
      </header>

      {/* ---------- Articles ---------- */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {byAuthor.map((post) => (
          <Link
            key={`${post.lang}:${post.slug}`}
            href={`/${lang}/journal/${post.slug}`}
            className="group block overflow-hidden rounded-3xl bg-white/18 ring-1 ring-(--olivea-olive)/10 backdrop-blur-md transition hover:bg-white/22"
          >
            {post.cover?.src ? (
              <div className="relative h-56 w-full bg-(--olivea-cream)/40">
                <Image
                  src={post.cover.src}
                  alt={post.cover.alt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                />
              </div>
            ) : null}

            <div className="p-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-70">
                {fmtDate(post.publishedAt, lang)} · {post.readingMinutes} min
              </div>

              <h2 className="mt-3 text-[20px] font-medium leading-tight text-(--olivea-olive)">
                {post.title}
              </h2>

              <p className="mt-2 text-[14px] leading-relaxed text-(--olivea-clay) opacity-90">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
