// lib/journal/author.ts
import type { Lang } from "@/app/(main)/[lang]/dictionaries";
import { getAuthorProfile } from "@/lib/journal/authors";

export type JournalAuthor = { id?: string; name: string };

type UnknownRecord = Record<string, unknown>;

function isRecord(x: unknown): x is UnknownRecord {
  return !!x && typeof x === "object";
}

export function normalizeAuthor(author: unknown, lang?: Lang): JournalAuthor {
  if (typeof author === "string" && author.trim()) {
    return { name: author.trim() };
  }

  if (isRecord(author)) {
    const idRaw = typeof author.id === "string" ? author.id.trim() : undefined;
    const nameRaw = typeof author.name === "string" ? author.name.trim() : "";

    if (idRaw) {
      const profile = getAuthorProfile(idRaw);
      if (profile) return { id: idRaw, name: profile.name };
      if (nameRaw) return { id: idRaw, name: nameRaw };
      return { id: idRaw, name: idRaw.replace(/[-_]/g, " ") };
    }

    if (nameRaw) return { name: nameRaw };
  }

  return { name: lang === "es" ? "Equipo Olivea" : "Olivea Editorial" };
}

export function authorName(author: unknown, lang?: Lang): string {
  return normalizeAuthor(author, lang).name;
}
