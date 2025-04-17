// app/journal/page.tsx

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const { data: posts, error } = await supabase
    .from("journal_posts")
    .select("id, title, slug, cover_image, published_at")
    .eq("visible", true)
    .order("published_at", { ascending: false });

  if (error) {
    return <p className="p-10 text-red-500">Error loading journal: {error.message}</p>;
  }

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-4xl font-semibold mb-4">Olivea Journal</h1>
      <p className="text-muted-foreground mb-10">Stories from the soil, the kitchen, and the heart.</p>

      <ul className="space-y-8">
        {posts?.map((post) => (
          <li key={post.id}>
            <Link href={`/journal/${post.slug}`} className="block group">
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="rounded-xl w-full h-60 object-cover mb-4 group-hover:opacity-90 transition"
                />
              )}
              <h2 className="text-2xl font-medium group-hover:underline">{post.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(post.published_at).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}