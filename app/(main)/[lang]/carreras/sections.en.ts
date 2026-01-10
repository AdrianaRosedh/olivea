// app/(main)/[lang]/carreras/sections.en.ts
export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CARRERAS_EN: NavSection[] = [
  { id: "vacantes", title: "Openings" },
  { id: "aplicar", title: "Application" },
];
