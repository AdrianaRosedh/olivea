import { dictionarySchema, type Dictionary } from "@/types"
import en from "./en.json"
import es from "./es.json"

type Locale = "en" | "es"

const dictionaries = { en, es }

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  // Default to English if locale is not supported
  const validLocale = ["en", "es"].includes(locale) ? (locale as Locale) : "en"

  const raw = dictionaries[validLocale]
  const parsed = dictionarySchema.safeParse(raw)

  if (!parsed.success) {
    console.error(`❌ Invalid translation file [${locale}]`)
    console.error(parsed.error.format())
    return dictionaries.en as Dictionary // Fallback to English
  }

  return parsed.data
}
