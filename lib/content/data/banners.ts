// lib/content/data/banners.ts
// Banner content — mirrors content/banners/active.json
//
// This is only the FALLBACK seed. The live banner is the Supabase `banners`
// table (managed at /admin/banners, read by app/api/banner/route.ts with 60s
// revalidate); this file is served only when Supabase is unavailable. Empty
// means "no banner" — the current default, after the MexBest vote campaign
// ended. Kept in sync with the live table so an outage degrades gracefully.

import type { BannerItem } from "../types";

const items: BannerItem[] = [];

export default items;
export { items };
