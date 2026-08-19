// lib/careers/areas.ts
// ─────────────────────────────────────────────────────────────────────
// The one list of areas a career belongs to.
//
// There used to be two. The public application form offered six fixed
// operational areas, while the admin's posting field was free text — HR typed
// "Marketing", which the form could not represent, so anyone applying to that
// role had to pick something false and it arrived filed under FOH.
//
// Both ends now read this list, so a posting can only carry an area an
// applicant can also choose. Postings and applications store the `value`;
// labels are looked up for display, which also means renaming an area in
// Spanish or English never touches stored data.
// ─────────────────────────────────────────────────────────────────────

export type Lang = "es" | "en";

export const CAREER_AREAS = [
  { value: "foh", es: "FOH / Servicio", en: "FOH / Service" },
  { value: "boh", es: "BOH / Cocina", en: "BOH / Kitchen" },
  { value: "garden", es: "Huerto / Grounds", en: "Garden / Grounds" },
  { value: "hotel", es: "Hotel / Casa Olivea", en: "Hotel / Casa Olivea" },
  { value: "cafe", es: "Café / Padel", en: "Café / Padel" },
  // Added because HR was already posting under it. It was the value that
  // exposed the mismatch in the first place.
  { value: "marketing", es: "Marketing", en: "Marketing" },
  { value: "ops", es: "Operaciones", en: "Operations" },
] as const;

export type CareerAreaValue = (typeof CAREER_AREAS)[number]["value"];

/**
 * Label for a stored value. Anything unrecognised is returned as-is rather
 * than blanked: older rows, or a value written before this list existed,
 * should still read as something in the admin instead of disappearing.
 */
export function areaLabel(value: string | null | undefined, lang: Lang): string {
  if (!value) return "";
  const found = CAREER_AREAS.find(
    (a) => a.value === value.trim().toLowerCase()
  );
  return found ? found[lang] : value;
}

/** True when a stored value is one this list knows about. */
export function isKnownArea(value: string | null | undefined): boolean {
  if (!value) return false;
  return CAREER_AREAS.some((a) => a.value === value.trim().toLowerCase());
}

/**
 * The value to persist for an area.
 *
 * Applications copy their area from the posting they came from, and a posting
 * can still hand over a label rather than a value — from an ISR-cached page
 * rendered before the data was normalised, or from a row written by an older
 * build. Folding it back to the canonical value here keeps applications
 * consistent with each other whatever the posting happens to carry.
 * Unrecognised values are kept verbatim rather than discarded.
 */
export function canonicalArea(value: string | null | undefined): string {
  if (!value) return "";
  const v = value.trim().toLowerCase();
  return CAREER_AREAS.some((a) => a.value === v) ? v : value.trim();
}
