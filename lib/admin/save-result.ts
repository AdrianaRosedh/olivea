// lib/admin/save-result.ts
//
// Deliberately a plain module, not part of the "use server" actions file:
// exporting anything other than an async function from one of those surfaces
// as a Turbopack char-boundary panic that hides the real error.

/** Outcome of a content save that carries an expected version. */
export type SaveResult =
  | { ok: true; version: string | null }
  | { ok: false; reason: "conflict"; savedBy: string | null; at: string | null };

/**
 * A save is rejected when the row moved since the editor loaded it.
 *
 * The editors send the whole document, so a blind write replaces fields the
 * writer never looked at: two people editing the same page — one the hero, one
 * the FAQ — and whoever saves second silently reverts the other's work. There
 * is no error and nothing on screen to notice; the change simply disappears the
 * next time the page is loaded.
 */
export function isConflict(r: SaveResult): r is Extract<SaveResult, { ok: false }> {
  return r.ok === false;
}
