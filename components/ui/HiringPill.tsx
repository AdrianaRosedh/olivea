// components/ui/HiringPill.tsx
// ─────────────────────────────────────────────────────────────────────
// Server component that decides whether the public "we're hiring" pill
// shows. HR controls it from the careers editor:
//   • "off"  → never
//   • "on"   → always (even with no live openings)
//   • "auto" → only when at least one job opening is Live  (default)
// Both reads are anon-key fetches with 60s ISR (revalidated on admin edits),
// so pages stay prerendered and this fails closed to "hidden" on any error.
// ─────────────────────────────────────────────────────────────────────

import { getLiveJobOpenings, getHiringPromo } from "@/lib/supabase/careers-actions";
import { openingSlug } from "@/lib/careers/slug";
import HiringPillClient from "./HiringPillClient";

export default async function HiringPill({ lang }: { lang: "es" | "en" }) {
  const [promo, openings] = await Promise.all([
    getHiringPromo(),
    getLiveJobOpenings(),
  ]);

  const count = openings.length;
  const show = promo === "on" || (promo === "auto" && count > 0);
  if (!show) return null;

  // Top live role for the one-role case (sorted by sort_order in the query).
  const role = count > 0 ? (lang === "es" ? openings[0].titleEs : openings[0].titleEn) : null;

  // A single live role deep-links to that posting, so the pill opens the job
  // itself rather than dropping the visitor at the top of a long page. With
  // several roles there is nothing to preselect — jump to the list instead.
  const href =
    count === 1
      ? `/${lang}/carreras?vacante=${openingSlug(openings[0], lang)}`
      : count > 1
        ? `/${lang}/carreras#vacantes`
        : `/${lang}/carreras`;

  // "on" with zero live openings: still promote, but as a generic invitation.
  return <HiringPillClient lang={lang} count={count} role={role} href={href} />;
}
