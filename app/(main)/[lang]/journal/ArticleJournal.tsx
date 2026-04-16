// app/(main)/[lang]/journal/ArticleJournal.tsx
// Server-rendered semantic article for crawlers, AI assistants, and no-JS clients.
// Renders the journal index as a list of post titles + excerpts.

import Link from "next/link";
import type { JournalIndexItem } from "@/lib/journal/load";

export default function ArticleJournal({
  lang,
  title,
  subtitle,
  posts,
}: {
  lang: "en" | "es";
  title: string;
  subtitle: string;
  posts: JournalIndexItem[];
}) {
  const isEs = lang === "es";

  return (
    <article
      aria-label={title}
      className="ssr-article"
      lang={isEs ? "es" : undefined}
      itemScope
      itemType="https://schema.org/Blog"
    >
      <meta itemProp="name" content="Olivea Journal" />

      <header>
        <h1>{title}</h1>
        <p><em>{subtitle}</em></p>
      </header>

      {posts.length === 0 ? (
        <p>{isEs ? "No hay publicaciones aún." : "No posts yet."}</p>
      ) : (
        <section aria-label={isEs ? "Publicaciones" : "Posts"}>
          {posts.map((post) => (
            <article key={post.slug} itemScope itemType="https://schema.org/BlogPosting">
              <h2 itemProp="headline">
                <Link href={`/${lang}/journal/${post.slug}`} itemProp="url">
                  {post.title}
                </Link>
              </h2>
              <p itemProp="abstract">{post.excerpt}</p>
              <p>
                <time dateTime={post.publishedAt} itemProp="datePublished">
                  {post.publishedAt}
                </time>
                {" · "}
                <span>{post.pillar}</span>
                {" · "}
                <span>{post.readingMinutes} {isEs ? "min de lectura" : "min read"}</span>
              </p>
            </article>
          ))}
        </section>
      )}
    </article>
  );
}
