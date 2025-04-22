import { dictionarySchema, type Dictionary } from "@/types"
import en from "./en.json"
import es from "./es.json"

type Locale = "en" | "es"

const dictionaries: Record<Locale, unknown> = { en, es }

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  if (!["en", "es"].includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`)
  }

  const raw = dictionaries[locale as Locale]
  const parsed = dictionarySchema.safeParse(raw)

  if (!parsed.success) {
    console.error(`❌ Invalid translation file [${locale}]`)
    console.error(parsed.error.format())
    throw new Error(`Invalid dictionary structure for locale "${locale}"`)
  }

  return parsed.data
}