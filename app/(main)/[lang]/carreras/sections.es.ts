// app/(main)/[lang]/carreras/sections.es.ts
export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CARRERAS_ES: NavSection[] = [
  { id: "vacantes", title: "Vacantes" },
  { id: "aplicar", title: "Aplicación" },
];
