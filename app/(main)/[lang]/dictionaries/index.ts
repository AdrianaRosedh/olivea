// app/[lang]/dictionaries/index.ts
import { dictionarySchema, type Dictionary } from "@/types/dictionarySchema"
import en from "./en.json"
import es from "./es.json"

// 1) Our two allowed locales…
export type Lang = "en" | "es"

// 2) The shape of the full thing `getDictionary` returns.
export type AppDictionary = Dictionary

const _dicts = { en, es }

export async function getDictionary(locale: Lang): Promise<AppDictionary> {
  const valid = locale === "es" ? "es" : "en"
  const raw = _dicts[valid]
  const parsed = dictionarySchema.safeParse(raw)
  if (!parsed.success) {
    console.error(`❌ Invalid translation file [${locale}]`, parsed.error.format())
    return _dicts.en as AppDictionary
  }
  return parsed.data
}