// lib/mexbest.ts
// Single source of truth for the MexBest 2026 Reader's Choice campaign.
//
// This is a dated, self-contained campaign: one `rm` of the vote route plus
// this file removes it. Everything that promotes the vote — the corner pill,
// and the "step aside" check the hiring pill uses so the two never stack — reads
// its live window from here, so there is one date to change, not several.

/** Vote-page paths, in both locales. Used to suppress the pill on the page it
 *  points at, and by the shell (LayoutShell, PopupHost, ClientProviders) to
 *  recognise the full-viewport route. */
export const VOTE_PATHS = ["/es/vota", "/en/vota"] as const;

export function isVotePath(pathname: string | null | undefined): boolean {
  return pathname === "/es/vota" || pathname === "/en/vota";
}

/**
 * The campaign window. `endsAt` is a placeholder until MexBest confirms the
 * ballot's close date — tighten it then. Kept as ISO strings with an explicit
 * Baja California offset so "live" means the same instant for every visitor.
 */
export const MEXBEST_CAMPAIGN = {
  enabled: true,
  startsAt: "2026-09-03T00:00:00-07:00",
  endsAt: "2026-12-31T23:59:59-08:00",
  votePath: (lang: "es" | "en") => `/${lang}/vota`,
} as const;

/** Whether the campaign is live right now — the one gate the pill and the
 *  hiring-pill deferral both call, so their behaviour can never drift apart. */
export function isVoteCampaignLive(now: Date = new Date()): boolean {
  if (!MEXBEST_CAMPAIGN.enabled) return false;
  const t = now.getTime();
  return (
    t >= new Date(MEXBEST_CAMPAIGN.startsAt).getTime() &&
    t <= new Date(MEXBEST_CAMPAIGN.endsAt).getTime()
  );
}
