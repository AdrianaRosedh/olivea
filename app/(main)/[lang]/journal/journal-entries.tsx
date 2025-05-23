// app/(main)/[lang]/journal/journal-entries.tsx
import { Suspense } from "react";
import type { Lang } from "../dictionaries";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

// 1️⃣ Data shape for a post
export type JournalPost = {
  id:           number;
  title:        string;
  slug:         string;
  cover_image:  string | null;
  published_at: string;
};

// 2️⃣ A little loading placeholder — returns JSX directly
export function EntryLoading() {
  return (
    <li className="animate-pulse">
      <div className="h-60 bg-gray-200 rounded-xl mb-4" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </li>
  );
}

// 3️⃣ Render one post
export function JournalEntry({
  post,
  lang,
}: {
  post: JournalPost;
  lang: Lang;
}) {
  return (
    <li key={post.id}>
      <Link href={`/${lang}/journal/${post.slug}`} className="block group">
        {post.cover_image ? (
          <div className="relative w-full h-60 mb-4 rounded-xl overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
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
        <h2 className="text-2xl font-medium group-hover:underline">{post.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      </Link>
    </li>
  );
}

// 4️⃣ Server component to fetch & stream
export default async function JournalEntries({
  lang,
}: {
  lang: Lang;
}) {
  const { data, error } = await supabase
    .from("journal_posts")
    .select("id, title, slug, cover_image, published_at");

  if (error) {
    throw new Error(error.message);
  }

  const posts = (data ?? []) as JournalPost[];
  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground">No posts yet.</p>;
  }

  return (
    <ul className="space-y-8">
      {posts.map((post) => (
        <Suspense key={post.id} fallback={<EntryLoading />}>
          <JournalEntry post={post} lang={lang} />
        </Suspense>
      ))}
    </ul>
  );
}