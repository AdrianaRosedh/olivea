// app/[lang]/(main)/contact/faq.ts
//
// Hours, address, and how to reach a person — the three things a contact page
// is asked for, phrased as questions so they can be retrieved as answers.
//
// The wording lives in contact_content.faq (edited in /admin → Contact). The
// facts inside it do not: an answer says {hours}, {address}, {email}, {phone}
// or {restaurantPhone} and the value is filled in here from /admin/hours, site
// settings and the restaurant's Google listing. Typing a fact into the answer
// would guarantee the FAQ and the page disagree the first time someone changes
// it — and stale opening hours are worse than none, because a guest drives
// out to a closed gate.

import type { FaqItem } from "@/components/seo/FaqJsonLd";
import type { Lang } from "@/lib/i18n";
import type { PageFaqEntry } from "@/lib/content/types";

export interface ContactFacts {
  /** One line per venue, e.g. "Olivea Farm To Table: Wed–Thu 4–7 pm." */
  hours?: string;
  address?: string;
  email?: string;
  phone?: string;
  restaurantPhone?: string;
}

const TOKEN = /\{(hours|address|email|phone|restaurantPhone)\}/g;

/** The CMS questions with their facts filled in. A question whose answer
 *  needs a fact that is not set is left out rather than printed half-empty. */
export function contactFaq(lang: Lang, entries: PageFaqEntry[] | undefined, facts: ContactFacts): FaqItem[] {
  const pick = (b: { en?: string; es?: string } | undefined) => (b?.[lang] || b?.en || "").trim();
  const out: FaqItem[] = [];
  for (const e of entries ?? []) {
    const q = pick(e.q);
    let missing = false;
    const a = pick(e.a).replace(TOKEN, (_, key: keyof ContactFacts) => {
      const v = facts[key]?.trim();
      if (!v) missing = true;
      return v ?? "";
    });
    if (q && a && !missing) out.push({ q, a });
  }
  return out;
}
