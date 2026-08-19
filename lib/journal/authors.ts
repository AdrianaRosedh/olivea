// lib/journal/authors.ts
import type { Lang } from "@/app/[lang]/(main)/dictionaries";
import { getLeader, getSortedTeam, loadLeader, type LeaderProfile } from "@/app/[lang]/(main)/team/teamData";
import { AUTHOR_EXTRAS } from "@/content/journal/authorExtras";
import type { AuthorExtra } from "@/content/journal/authorExtras";

export type ResolvedAuthorProfile = {
  id: string;
  name: string;
  title?: { es: string; en: string };
  bio?: { es: string; en: string };
  image?: string;
  sameAs?: string[];
  worksFor?: string;
  source?: "team" | "extras";
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function linksToSameAs(links: Array<{ href: string }> | undefined): string[] | undefined {
  const out = (links ?? [])
    .map((l) => l.href)
    .filter((href) => isExternal(href));
  return out.length ? out : undefined;
}

function hasI18n(x: { es: string; en: string } | undefined): boolean {
  if (!x) return false;
  return Boolean((x.es && x.es.trim()) || (x.en && x.en.trim()));
}

function inferWorksFor(team: LeaderProfile | undefined): string | undefined {
  if (!team?.org) return undefined;
  return hasI18n(team.org) ? "Olivea" : undefined;
}

function fromTeam(id: string, team: LeaderProfile): ResolvedAuthorProfile {
  return {
    id,
    name: team.name,
    title: team.role,
    bio: team.bio,
    image: team.avatar,
    sameAs: linksToSameAs(team.links),
    worksFor: inferWorksFor(team),
    source: "team",
  };
}

function fromExtras(id: string, extra: AuthorExtra): ResolvedAuthorProfile {
  return {
    id,
    name: extra.name,
    title: extra.title,
    bio: extra.bio,
    image: extra.image,
    sameAs: extra.sameAs,
    worksFor: extra.worksFor,
    source: "extras",
  };
}

/**
 * Resolve author profiles:
 * 1) TEAM (if id matches a team member)
 * 2) AUTHOR_EXTRAS (non-team authors)
 */
export function getAuthorProfile(id: string): ResolvedAuthorProfile | null {
  // Synchronous variant — uses static TEAM fallback only.
  // Server callers should prefer loadAuthorProfile() to honor admin DB edits.
  const team = getLeader(id);
  if (team) return fromTeam(id, team);

  const extra = AUTHOR_EXTRAS[id];
  if (extra) return fromExtras(id, extra);

  return null;
}

/**
 * Every author that can be credited, for pickers in the admin.
 *
 * The admin took the author name and id as free text, so a typo in either
 * silently broke the link to the author's profile page — the id has to match a
 * TEAM member or an AUTHOR_EXTRAS key exactly. Offering the real list makes the
 * correct pairing the easy path.
 *
 * Synchronous and static on purpose: this feeds a client-side picker, and the
 * static roster is the same source getAuthorProfile() resolves against.
 */
export function listAuthorProfiles(): Array<{
  id: string;
  name: string;
  source: "team" | "extras";
}> {
  const team = getSortedTeam().map((m) => ({
    id: m.id,
    name: m.name,
    source: "team" as const,
  }));
  const extras = Object.values(AUTHOR_EXTRAS).map((e) => ({
    id: e.id,
    name: e.name,
    source: "extras" as const,
  }));
  const seen = new Set(team.map((t) => t.id));
  return [...team, ...extras.filter((e) => !seen.has(e.id))];
}

/** Async variant: prefers DB-stored team roster, falls back to TEAM/AUTHOR_EXTRAS. */
export async function loadAuthorProfile(id: string): Promise<ResolvedAuthorProfile | null> {
  const team = await loadLeader(id);
  if (team) return fromTeam(id, team);

  const extra = AUTHOR_EXTRAS[id];
  if (extra) return fromExtras(id, extra);

  return null;
}

export function localizedAuthorTitle(profile: ResolvedAuthorProfile, lang: Lang): string | undefined {
  if (!profile.title) return undefined;
  return lang === "es" ? profile.title.es : profile.title.en;
}

export function localizedAuthorBio(profile: ResolvedAuthorProfile, lang: Lang): string | undefined {
  if (!profile.bio) return undefined;
  return lang === "es" ? profile.bio.es : profile.bio.en;
}
