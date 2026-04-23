// lib/content/data/faq.ts
// Centralized FAQ data across all pages
// In the admin, this will be editable per-page

import type { FaqItem } from "../types";
import casa from "./casa";

// Aggregate FAQs from all page data files
const items: FaqItem[] = [
  ...casa.faq,
  // Add farmtotable.faq, cafe.faq etc. as they're populated
];

export default items;
export { items };
