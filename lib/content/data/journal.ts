// lib/content/data/journal.ts
// Static fallback journal data — used when Supabase is not configured.

import { mockJournalPosts } from "@/lib/admin/mock-data";
import type { JournalPost } from "../types";

const items: JournalPost[] = mockJournalPosts;
export default items;
export { items };
