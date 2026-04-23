// lib/content/data/wines.ts
// Static fallback wine data — used when Supabase is not configured.
// When Supabase is available, the admin and public site fetch from the wines table directly.

import { mockWines } from "@/lib/admin/mock-data";
import type { WineItem } from "../types";

const items: WineItem[] = mockWines;
export default items;
export { items };
