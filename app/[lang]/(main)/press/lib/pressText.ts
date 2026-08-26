// app/(main)/[lang]/press/lib/pressText.ts
import { formatPublicDate } from "@/lib/date/public-date";
import type { Identity, Lang } from "../pressTypes";

export function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

export function fmtDate(lang: Lang, iso: string) {
  return formatPublicDate(iso, lang);
}

export function identityLabel(lang: Lang, x: Identity) {
  if (x === "all") return tt(lang, "Todos", "All");
  if (x === "olivea") return "Olivea";
  if (x === "hotel") return tt(lang, "Hotel", "Hotel");
  if (x === "restaurant") return tt(lang, "Restaurante", "Restaurant");
  return tt(lang, "Café", "Café");
}
