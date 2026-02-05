// lib/popup/getSitewidePopup.ts
import { listJournalIndex } from "@/lib/journal/load";

export async function getSitewidePopup(lang: "es" | "en") {
  // If you want to “turn off” popups easily:
  // return null;

  const posts = await listJournalIndex(lang);
  const latest = posts[0];
  if (!latest) return null;

  // Use translationId so ES/EN share the same “seen” identity
  const id = `journal:${latest.translationId}`;

  return {
    id,
    kind: "journal" as const,
    lang,
    title: latest.title,
    excerpt: latest.excerpt,
    href: `/${lang}/journal/${latest.slug}`,
    coverSrc: latest.cover?.src,
    coverAlt: latest.cover?.alt,
    badge: lang === "es" ? "Nuevo en el Journal" : "New in the Journal",
  };
}
