// lib/journal/authors.server.ts
// Author lookup that honours the team roster as edited in /admin. Server-only
// (it reads the database); the static resolvers in authors.ts stay usable
// from client components such as the journal editor's author picker.

import "server-only";
import { loadLeader } from "@/app/[lang]/(main)/team/teamData.server";
import { AUTHOR_EXTRAS } from "@/content/journal/authorExtras";
import { fromExtras, fromTeam, type ResolvedAuthorProfile } from "./authors";

/** Prefers the DB-stored team roster, falls back to TEAM / AUTHOR_EXTRAS. */
export async function loadAuthorProfile(id: string): Promise<ResolvedAuthorProfile | null> {
  const team = await loadLeader(id);
  if (team) return fromTeam(id, team);
  const extra = AUTHOR_EXTRAS[id];
  if (extra) return fromExtras(id, extra);
  return null;
}
