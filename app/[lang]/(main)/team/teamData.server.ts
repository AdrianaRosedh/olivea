// app/[lang]/(main)/team/teamData.server.ts
// The team roster as edited in /admin (Supabase), with the static TEAM in
// teamData.ts as the fallback. Server-only: it reads the database, and
// teamData.ts must stay importable from client components (the link pages and
// the journal editor use its static data), so the loaders live here.

import "server-only";
import { TEAM, findMemberInList, type LeaderProfile } from "./teamData";

/** Members from getContent("team") when present, else the static TEAM. */
export async function loadTeam(): Promise<LeaderProfile[]> {
  try {
    const { getContent } = await import("@/lib/content");
    const team = await getContent("team");
    const members = team.members;
    if (Array.isArray(members) && members.length > 0) {
      return members as unknown as LeaderProfile[];
    }
  } catch {
    // fall through to the static roster
  }
  return TEAM;
}

export async function loadSortedTeam(): Promise<LeaderProfile[]> {
  const list = await loadTeam();
  return [...list].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
}

export async function loadLeader(id?: string | null): Promise<LeaderProfile | undefined> {
  if (!id) return undefined;
  const list = await loadTeam();
  return findMemberInList(list, String(id));
}
