export type Lang = "es" | "en";

/**
 * The six chapters the page shipped with.
 *
 * No longer exhaustive, and deliberately not used to type a section's id.
 * Sections are defined in the CMS now, so an editor can add, remove or
 * rename one — a closed union here would mean the page could only ever
 * render chapters that a developer had hardcoded first. Kept because the
 * names are still useful to read.
 */
export type KnownPhilosophySectionId =
  | "origins"
  | "vision"
  | "sustainability"
  | "technology"
  | "gastronomy"
  | "community";

export type PhilosophySection = {
  id: string;
  order: number;
  title: string;
  subtitle?: string;

  // small “chips”
  signals?: string[];

  // bullet list module
  practices?: string[];

  // chapter body (mdx content string)
  body: string;
};
