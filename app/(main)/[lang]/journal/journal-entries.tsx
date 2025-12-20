// app/(main)/[lang]/journal/journal-entries.tsx
import type { Lang } from "../dictionaries";
import Link from "next/link";
import Image from "next/image";
import { listJournalIndex } from "@/lib/journal/load";

export function EntryLoading() {
  return (
    <li className="animate-pulse">
      <div className="h-60 bg-gray-200 rounded-xl mb-4" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </li>
  );
}

export default async function JournalEntries({ lang }: { lang: Lang }) {
  const posts = await listJournalIndex(lang);

  if (!posts.length) {
    return <p className="text-center text-muted-foreground">No posts yet.</p>;
  }

  return (
    <ul className="space-y-10">
      {posts.map((post) => (
        <li key={`${post.lang}:${post.slug}`}>
          <Link href={`/${lang}/journal/${post.slug}`} className="block group">
            {post.cover?.src ? (
              <div className="relative w-full h-60 mb-4 rounded-xl overflow-hidden">
                <Image
                  src={post.cover.src}
                  alt={post.cover.alt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:opacity-90 transition"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full h-60 mb-4 bg-muted rounded-xl flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}

            <div className="text-xs uppercase tracking-wider opacity-70">
              {post.pillar} · {post.publishedAt} · {post.readingMinutes} min
            </div>

            <h2 className="mt-2 text-2xl font-medium group-hover:underline">
              {post.title}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}