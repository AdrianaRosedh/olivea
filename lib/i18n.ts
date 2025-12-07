// lib/i18n.ts
import { getDictionary } from "@/app/(main)/[lang]/dictionaries";
import type {
  Lang as DictLang,
  AppDictionary as DictAppDictionary,
} from "@/app/(main)/[lang]/dictionaries";

// Re-export the types so other modules can import them from "@/lib/i18n"
export type Lang = DictLang;
export type AppDictionary = DictAppDictionary;

// Accept either a string or Lang and normalize to "es" | "en"
export async function loadLocale({
  lang: rawLang,
}: {
  lang: string | Lang;
}): Promise<{ lang: Lang; dict: AppDictionary }> {
  const lang: Lang = rawLang === "es" ? "es" : "en";
  const dict = await getDictionary(lang);
  return { lang, dict };
}