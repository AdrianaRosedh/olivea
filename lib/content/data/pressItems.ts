// lib/content/data/pressItems.ts
// DONE (2026-07-07): press items are now served from the press_items
// table in Supabase, managed at /admin/press. The press page's loader
// (app/(main)/[lang]/press/load.ts) reads the DB first and only falls
// back to the legacy MDX files when the table is empty/unreachable.
// This seed stays empty — the MDX files ARE the static fallback.

import type { PressItemFull } from "../types";

const items: PressItemFull[] = [];
export default items;
export { items };
