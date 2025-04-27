import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { getDictionary } from "../../dictionaries"

export async function generateStaticParams() {
  const { data: posts } = await supabase.from("journal_posts").select("slug").eq("visible", true)

  return posts?.map((post) => ({ slug: post.slug })) || []
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ lang: "es" | "en"; slug: string }>
}) {
  const { lang, slug } = await params
  const dict = await getDictionary(lang)

  let postData

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const { data, error } = await supabase
      .from("journal_posts")
      .select("title, cover_image, published_at, author_name, body")
      .eq("slug", slug)
      .eq("visible", true)
      .single()

    clearTimeout(timeoutId)

    if (error || !data) {
      throw error
    }

    postData = data

    // Track page view without blocking the response
    // Use a separate try/catch block and don't await the result
    try {
      // Fire and forget - don't use await or Promise methods
      const trackViewPromise = async () => {
        try {
          await supabase.rpc("increment_post_views", { post_slug: slug })
        } catch (err) {
          console.error("Error incrementing view count:", err)
        }
      }

      // Execute the function without awaiting it
      trackViewPromise()
    } catch (viewError) {
      // Catch any synchronous errors
      console.error("Error setting up view tracking:", viewError)
    }
  } catch (err) {
    console.error("Error fetching post:", err)
    return notFound()
  }

  return (
    <main className="p-10 max-w-2xl mx-auto">
      {postData.cover_image && (
        <img
          src={postData.cover_image || "/placeholder.svg"}
          alt={postData.title}
          className="rounded-xl w-full h-64 object-cover mb-6"
        />
      )}
      <h1 className="text-3xl font-semibold mb-2">{postData.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {new Date(postData.published_at).toLocaleDateString()} — {dict.journal.by} {postData.author_name || "Olivea"}
      </p>
      <article className="prose prose-neutral dark:prose-invert">{postData.body}</article>
    </main>
  )
}
