import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { getDictionary } from "../dictionaries"

// This component will fetch and display a single journal entry
// Breaking it into smaller components helps with streaming
async function JournalEntry({ post, lang }: { post: any; lang: string }) {
  // Artificial delay to demonstrate streaming (remove in production)
  // await new Promise((resolve) => setTimeout(resolve, 300 * Math.random()))

  return (
    <li key={post.id}>
      <Link href={`/${lang}/journal/${post.slug}`} className="block group">
        {post.cover_image ? (
          <div className="relative w-full h-60 mb-4 rounded-xl overflow-hidden">
            <Image
              src={post.cover_image || "/placeholder.svg"}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:opacity-90 transition"
              priority={false}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full h-60 mb-4 bg-muted rounded-xl flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        <h2 className="text-2xl font-medium group-hover:underline">{post.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{new Date(post.published_at).toLocaleDateString()}</p>
      </Link>
    </li>
  )
}

// Loading component for individual entries
function EntryLoading() {
  return (
    <li className="animate-pulse">
      <div className="h-60 bg-gray-200 rounded-xl mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </li>
  )
}

// Main component to fetch all journal entries
export default async function JournalEntries({ lang }: { lang: string }) {
  const dict = await getDictionary(lang)

  const { data: posts, error } = await supabase
    .from("journal_posts")
    .select("id, title, slug, cover_image, published_at")
    .eq("visible", true)
    .order("published_at", { ascending: false })

  if (error) {
    throw new Error(`${dict.journal.error} ${error.message}`)
  }

  if (!posts || posts.length === 0) {
    return <p className="text-muted-foreground">{dict.journal.empty}</p>
  }

  return (
    <ul className="space-y-8">
      {posts.map((post) => (
        <Suspense key={post.id} fallback={<EntryLoading />}>
          <JournalEntry post={post} lang={lang} />
        </Suspense>
      ))}
    </ul>
  )
}
