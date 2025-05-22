// lib/i18n.ts
import { getDictionary } from "@/app/(main)/[lang]/dictionaries"
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries"

export async function loadLocale({
  lang: rawLang,
}: {
  lang: string
}): Promise<{ lang: Lang; dict: AppDictionary }> {
  const lang: Lang = rawLang === "es" ? "es" : "en"
  const dict = await getDictionary(lang)
  return { lang, dict }
}