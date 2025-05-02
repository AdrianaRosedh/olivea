import type { Metadata } from "next"
import { getDictionary, type Lang } from "../dictionaries"
import ContactForm from "./contact-form"

export async function generateMetadata({
  params,
}: {
  // params is now a Promise in 15.3+
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // 1️⃣ Await the params promise
  const { lang: rawLang } = await params
  // 2️⃣ Narrow into your Lang union
  const lang: Lang = rawLang === "es" ? "es" : "en"
  // 3️⃣ Load translations
  const dict = await getDictionary(lang)

  return {
    title:       dict.contact.title,
    description: dict.contact.description,
  }
}

export default async function ContactPage({
  params,
}: {
  // same here: params is a Promise
  params: Promise<{ lang: string }>
}) {
  // 1️⃣ Await and coerce
  const { lang: rawLang } = await params
  const lang: Lang = rawLang === "es" ? "es" : "en"
  // 2️⃣ Load translations
  const dict = await getDictionary(lang)

  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">
        {dict.contact.title}
      </h1>
      <p className="text-muted-foreground mb-6">
        {dict.contact.description}
      </p>

      {/* Client-side form */}
      <ContactForm lang={lang} />
    </main>
  )
}