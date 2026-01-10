// lib/journal/authors.ts
import type { Lang } from "@/app/(main)/[lang]/dictionaries";
import { getLeader, type LeaderProfile } from "@/app/(main)/[lang]/team/teamData";
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
  const team = getLeader(id);
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
