// lib/content/data/pressItems.ts
// Press articles are loaded from MDX at build time by the existing
// press/load.ts function. This data file serves as a bridge so the
// admin can eventually manage press items without MDX files.
//
// For now, it's an empty array — the press page continues to use
// its own load.ts loader. Once Supabase is connected, press items
// will be created/edited in admin and served from here.

import type { PressItemFull } from "../types";

const items: PressItemFull[] = [];
export default items;
export { items };
