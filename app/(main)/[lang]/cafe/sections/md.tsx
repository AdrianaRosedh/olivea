// Bilingual text helpers — shared with Casa/FTT, duplicated here for tree-shaking
import type { ReactNode } from "react";

/** Pick en/es string from a bilingual object */
export function t(
  obj: { en: string; es: string } | undefined,
  lang: string
): string {
  if (!obj) return "";
  return lang === "es" ? obj.es : obj.en;
}

/** Convert **bold** markdown to <strong> JSX */
export function md(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

/** t() + md() combined */
export function tm(
  obj: { en: string; es: string } | undefined,
  lang: string
): ReactNode {
  return md(t(obj, lang));
}
