import { getDictionary } from "../dictionaries"

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: "es" | "en" }>
}) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.about.title}</h1>
      <p className="mt-2 text-muted-foreground">{dict.about.description}</p>
    </main>
  )
}
