import { getDictionary } from "../dictionaries"
import ContactForm from "./contact-form"

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.contact.title}</h1>
      <p className="mt-2 text-muted-foreground mb-8">{dict.contact.description}</p>

      <div className="max-w-md mx-auto">
        <ContactForm lang={lang} />
      </div>
    </main>
  )
}
