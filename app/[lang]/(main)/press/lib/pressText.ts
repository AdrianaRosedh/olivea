// app/(main)/[lang]/press/lib/pressText.ts
import type { Identity, Lang } from "../pressTypes";

export function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

export function fmtDate(lang: Lang, iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function identityLabel(lang: Lang, x: Identity) {
  if (x === "all") return tt(lang, "Todos", "All");
  if (x === "olivea") return "Olivea";
  if (x === "hotel") return tt(lang, "Hotel", "Hotel");
  if (x === "restaurant") return tt(lang, "Restaurante", "Restaurant");
  return tt(lang, "Café", "Café");
}
