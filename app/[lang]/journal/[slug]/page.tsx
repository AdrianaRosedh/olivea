// app/[lang]/journal/[slug]/page.tsx
import { supabase } from "@/lib/supabase"
import { notFound }  from "next/navigation"
import { getDictionary, type Lang } from "../../dictionaries"
import type { Metadata }            from "next"

// 1️⃣ Build your head tags, but await params first
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params
  const lang: Lang = rawLang === "es" ? "es" : "en"

  // fetch just enough for the <head>
  const { data } = await supabase
    .from("journal_posts")
    .select("title, description, cover_image")
    .eq("slug", slug)
    .single()

  if (!data) {
    return { title: "Journal Post" }
  }

  return {
    title:       data.title,
    description: data.description ?? undefined,
    openGraph: data.cover_image
      ? { images: [{ url: data.cover_image }] }
      : undefined,
  }
}

// 2️⃣ The page itself also awaits params before using them
export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: rawLang, slug } = await params
  const lang: Lang = rawLang === "es" ? "es" : "en"

  const dict = await getDictionary(lang)

  const { data, error } = await supabase
    .from("journal_posts")
    .select("title, cover_image, published_at, author_name, body")
    .eq("slug", slug)
    .eq("visible", true)
    .single()

  if (error || !data) {
    return notFound()
  }

  // fire‐and‐forget view tracking
  ;(async () => {
    try {
      await supabase.rpc("increment_post_views", { post_slug: slug })
    } catch {
      /* ignore */
    }
  })()

  return (
    <main className="p-10 max-w-2xl mx-auto">
      {data.cover_image && (
        <img
          src={data.cover_image}
          alt={data.title}
          className="rounded-xl w-full h-64 object-cover mb-6"
        />
      )}

      <h1 className="text-3xl font-semibold mb-2">{data.title}</h1>

      <p className="text-sm text-muted-foreground mb-6">
        {new Date(data.published_at).toLocaleDateString()} — {dict.journal.by}{" "}
        {data.author_name || "Olivea"}
      </p>

      <article className="prose prose-neutral dark:prose-invert">
        {data.body}
      </article>
    </main>
  )
}