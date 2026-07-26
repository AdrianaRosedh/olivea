// Shared between the journal list view (which detects the clash) and the
// editor (which renders the message). Lives in its own module so the list can
// import it without pulling the dynamically-loaded editor into the main bundle.

/** journal_posts.slug is UNIQUE. Thrown as `${SLUG_TAKEN_PREFIX}${slug}` so the
 *  editor can show a bilingual, actionable message instead of a raw Postgres
 *  constraint error. */
export const SLUG_TAKEN_PREFIX = "SLUG_TAKEN:";
