export type Lang = "es" | "en";

export type PhilosophySectionId =
  | "origins"
  | "vision"
  | "sustainability"
  | "technology"
  | "gastronomy"
  | "community";

export type PhilosophySection = {
  id: PhilosophySectionId;
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
