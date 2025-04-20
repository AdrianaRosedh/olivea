import { supabase } from '@/lib/supabase'
import { getDictionary } from '../dictionaries'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function JournalPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'es' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  let posts = null
  let error = null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)

    const res = await supabase
      .from('journal_posts')
      .select('id, title, slug, cover_image, published_at')
      .eq('visible', true)
      .order('published_at', { ascending: false })

    posts = res.data
    error = res.error

    clearTimeout(timeout)
  } catch (err) {
    console.error('Supabase fetch error:', err)
    error = { message: 'Request timed out or failed.' }
  }

  if (error) {
    return (
      <p className="p-10 text-red-500">
        {dict.journal.error} {error.message}
      </p>
    )
  }

  if (!posts) {
    return <p className="p-10 text-muted-foreground">{dict.journal.loading}</p>
  }

  if (posts.length === 0) {
    return <p className="p-10 text-muted-foreground">{dict.journal.empty}</p>
  }

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-4xl font-semibold mb-4">{dict.journal.title}</h1>
      <p className="text-muted-foreground mb-10">{dict.journal.subtitle}</p>

      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/${lang}/journal/${post.slug}`} className="block group">
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
  )
}