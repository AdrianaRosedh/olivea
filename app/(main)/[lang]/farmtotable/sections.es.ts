// app/(main)/[lang]/farmtotable/sections.es.ts
// IDs must match the DOM (.main-section / .subsection ids rendered by the
// section components — sub ids are canonical English in the DOM regardless
// of language; only the titles are localized). Order must match page flow.
// Verified against the live DOM by e2e/dock-nav.spec.ts.
import type { NavSection } from "@/lib/sections";

export const SECTIONS_ES: NavSection[] = [
  {
    id: "experiencia",
    title: "La experiencia",
    subs: [
      { id: "origin", title: "Origen" },
      { id: "balance", title: "Equilibrio" },
      { id: "values", title: "Valores" },
    ],
  },
  {
    id: "cocina",
    title: "La cocina",
    subs: [
      { id: "product", title: "Producto" },
      { id: "technique", title: "Técnica" },
      { id: "team", title: "Equipo" },
    ],
  },
  {
    id: "mesa",
    title: "La mesa",
    subs: [
      { id: "hospitality", title: "Hospitalidad" },
      { id: "narrative", title: "Narrativa" },
      { id: "terrace", title: "Terraza" },
    ],
  },
  {
    id: "despensa",
    title: "La despensa",
    subs: [
      { id: "territory", title: "Territorio" },
      { id: "ecosystem", title: "Sistema" },
      { id: "cycle", title: "Ciclo" },
      { id: "fermentation", title: "Fermentación" },
      { id: "research", title: "Investigación" },
      { id: "chef-daniel", title: "Chef Daniel" },
      { id: "storytelling", title: "Relato" },
    ],
  },
  {
    id: "gallery",
    title: "Galería",
    subs: [],
  },
  {
    id: "menu",
    title: "Menú",
    subs: [],
  },
  {
    id: "faq",
    title: "Preguntas frecuentes",
    subs: [],
  },
];
