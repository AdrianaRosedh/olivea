// app/[lang]/(main)/journal/[slug]/RelatedPosts.tsx
// "Keep reading" at the end of an article: up to three other posts, the ones
// sharing the most tags first, then the most recent. Rendered on the server,
// so it is there before any JavaScript runs.

import Image from "next/image";
import Link from "next/link";
import type { JournalIndexItem } from "@/lib/journal/load";
import { formatPublicDateLong } from "@/lib/date/public-date";

type Lang = "es" | "en";

export function pickRelated(
  all: JournalIndexItem[],
  current: { slug: string; tags?: string[] },
  max = 3
): JournalIndexItem[] {
  const mine = new Set((current.tags ?? []).map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({
      p,
      shared: (p.tags ?? []).filter((t) => mine.has(t.toLowerCase())).length,
    }))
    .sort((a, b) => b.shared - a.shared || (a.p.publishedAt < b.p.publishedAt ? 1 : -1))
    .slice(0, max)
    .map((x) => x.p);
}

export default function RelatedPosts({ lang, posts }: { lang: Lang; posts: JournalIndexItem[] }) {
  if (posts.length === 0) return null;
  const heading = lang === "es" ? "Sigue leyendo" : "Keep reading";

  return (
    <section aria-labelledby="related-heading" className="mt-16 border-t border-(--olivea-olive)/12 pt-10">
      <h2
        id="related-heading"
        className="text-[12px] uppercase tracking-[0.3em] text-(--olivea-olive)"
      >
        {heading}
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/${lang}/journal/${p.slug}`}
              className="group block overflow-hidden rounded-2xl border border-(--olivea-olive)/12 bg-white/55 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(40,60,35,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/40"
            >
              {p.cover?.src && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.cover.src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ objectPosition: p.cover.position ?? "50% 50%" }}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="text-[12px] text-(--olivea-olive)">
                  <time dateTime={p.publishedAt}>{formatPublicDateLong(p.publishedAt, lang)}</time>
                  {" · "}
                  {p.readingMinutes} min
                </div>
                <h3
                  className="mt-2 text-[18px] leading-snug font-semibold text-(--olivea-ink)"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {p.title}
                </h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
