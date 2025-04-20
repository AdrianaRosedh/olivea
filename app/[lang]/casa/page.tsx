import { getDictionary } from '../dictionaries'

export default async function CasaPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'es' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.casa.title}</h1>
      <p className="mt-2 text-muted-foreground">{dict.casa.description}</p>
    </main>
  )
}