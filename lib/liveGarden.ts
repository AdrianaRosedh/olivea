// lib/liveGarden.ts
// Opening the roseiies live garden map from anywhere on the site.
//
// The map itself lives in components/live-garden/LiveGarden.tsx (mounted once
// in the app providers). Anything else — an inline "see the garden live" link,
// the phone menu — asks it to open with this event, naming where the request
// came from so each opening is counted by source in analytics.

/** Window event the LiveGarden component listens for. */
export const LIVE_GARDEN_OPEN_EVENT = "olivea:live-garden";

/** Where a map opening came from (sent with the analytics event). */
export type LiveGardenSource =
  | "orb"
  | "orb-intro"
  | "link-farmtotable"
  | "link-cafe"
  | "link-philosophy"
  | "other";

export type LiveGardenOpenDetail = { source: LiveGardenSource };

export function openLiveGarden(source: LiveGardenSource): void {
  window.dispatchEvent(new CustomEvent<LiveGardenOpenDetail>(LIVE_GARDEN_OPEN_EVENT, { detail: { source } }));
}
