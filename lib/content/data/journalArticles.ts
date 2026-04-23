// lib/content/data/journalArticles.ts
// Full journal articles — currently loaded from MDX at build time.
// This bridge file enables admin to manage articles in the future.
// For now, empty — journal page uses its own MDX loader.

import type { JournalArticle } from "../types";

const items: JournalArticle[] = [];
export default items;
export { items };
