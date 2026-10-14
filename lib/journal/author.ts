// lib/journal/author.ts
import type { Lang } from "@/app/[lang]/(main)/dictionaries";
import { getAuthorProfile, listAuthorProfiles } from "@/lib/journal/authors";

export type JournalAuthor = { id?: string; name: string };

type UnknownRecord = Record<string, unknown>;

function isRecord(x: unknown): x is UnknownRecord {
  return !!x && typeof x === "object";
}

/** Lower-case, accents stripped: "Adriana Rose" matches "adriana rosé". */
function nameKey(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

/**
 * The credited author for a plain-text name, with the profile id when the name
 * is a known author's. Posts saved before the admin's author picker store only
 * text ("Daniel Nates"); without the id there was no link to the author's page.
 */
function authorFromName(name: string): JournalAuthor {
  const key = nameKey(name);
  const match = listAuthorProfiles().find((p) => nameKey(p.name) === key);
  return match ? { id: match.id, name: match.name } : { name: name.trim() };
}

/** "Adriana Rose & Daniel Nates", "A y B", "A and B", "A, B y C" → names. */
function splitAuthorNames(text: string): string[] {
  return text
    .split(/\s*(?:,|&|\by\b|\band\b)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeAuthor(author: unknown, lang?: Lang): JournalAuthor {
  if (typeof author === "string" && author.trim()) {
    return authorFromName(author);
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

/**
 * Normalize a frontmatter into an ordered list of authors.
 * Precedence: `authors` (array) > `author` (single).
 * Always returns at least one author — falls back to the locale default.
 */
export function normalizeAuthors(
  fm: { authors?: unknown; author?: unknown } | null | undefined,
  lang?: Lang
): JournalAuthor[] {
  if (fm && Array.isArray(fm.authors) && fm.authors.length > 0) {
    const list = fm.authors
      .map((a) => normalizeAuthor(a, lang))
      .filter((a) => !!a.name);
    if (list.length > 0) return list;
  }
  // A plain-text credit can name several people: credit each one.
  if (typeof fm?.author === "string" && fm.author.trim()) {
    const names = splitAuthorNames(fm.author);
    if (names.length > 1) return names.map(authorFromName);
  }
  return [normalizeAuthor(fm?.author, lang)];
}

/** "Adriana Rose y Daniel Nates" / "Adriana Rose and Daniel Nates" / "A, B y C" */
export function joinAuthorNames(
  authors: JournalAuthor[],
  lang?: Lang
): string {
  const names = authors.map((a) => a.name).filter(Boolean);
  if (names.length === 0) return lang === "es" ? "Equipo Olivea" : "Olivea Editorial";
  if (names.length === 1) return names[0];
  const conjunction = lang === "es" ? " y " : " and ";
  if (names.length === 2) return names.join(conjunction);
  const head = names.slice(0, -1).join(", ");
  const tail = names[names.length - 1];
  return `${head},${conjunction}${tail}`;
}
