// app/journal/[slug]/page.tsx

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from("journal_posts")
    .select("slug")
    .eq("visible", true);

  return posts?.map((post) => ({ slug: post.slug })) || [];
}

export default async function JournalPostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("visible", true)
    .single();

  if (!post) return notFound();

  return (
    <main className="p-10 max-w-2xl mx-auto">
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="rounded-xl w-full h-64 object-cover mb-6"
        />
      )}
      <h1 className="text-3xl font-semibold mb-2">{post.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {new Date(post.published_at).toLocaleDateString()} — by {post.author_name || "Olivea"}
      </p>
      <article className="prose prose-neutral dark:prose-invert">
        {post.body}
      </article>
    </main>
  );
}