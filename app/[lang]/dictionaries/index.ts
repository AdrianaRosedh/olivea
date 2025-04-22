import { dictionarySchema } from "@/types/dictionarySchema"
import type { Dictionary } from "@/types"

type Locale = "en" | "es"

import en from "./en.json"
import es from "./es.json"

const rawDictionaries: Record<Locale, unknown> = {
  en,
  es,
}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  if (!["en", "es"].includes(locale)) {
    throw new Error(`No dictionary found for locale: ${locale}`)
  }

  const raw = rawDictionaries[locale as Locale]
  const parsed = dictionarySchema.safeParse(raw)

  if (!parsed.success) {
    console.error("❌ Invalid dictionary structure:", parsed.error.format())
    throw new Error(`Invalid dictionary format for locale: ${locale}`)
  }

  return parsed.data
}