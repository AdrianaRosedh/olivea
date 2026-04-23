// lib/content/data/drinks.ts
// Static fallback drink data — used when Supabase is not configured.

import { mockDrinks } from "@/lib/admin/mock-data";
import type { DrinkItem } from "../types";

const items: DrinkItem[] = mockDrinks;
export default items;
export { items };
