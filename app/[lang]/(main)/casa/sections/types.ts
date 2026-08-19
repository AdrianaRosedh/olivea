// Shared types for data-driven Casa sections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionData = Record<string, any>;
export type Lang = "en" | "es";
export interface SectionProps {
  data: SectionData;
  lang: Lang;
}
