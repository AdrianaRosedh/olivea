// app/(main)/[lang]/farmtotable/sections.en.ts
import type { NavSection } from "./sections.es";

export const SECTIONS_EN: NavSection[] = [
  {
    id: "experience",
    title: "The experience",
    subs: [
      { id: "origin",  title: "Origin" },
      { id: "balance", title: "Balance" },
      { id: "values",  title: "Values" },
    ],
  },
  {
    id: "kitchen",
    title: "The kitchen",
    subs: [
      { id: "product",   title: "Product" },
      { id: "technique", title: "Technique" },
      { id: "team",      title: "Team" },
    ],
  },
  {
    id: "table",
    title: "The table",
    subs: [
      { id: "hospitality", title: "Hospitality" },
      { id: "narrative",   title: "Narrative" },
    ],
  },
  {
    id: "pantry",
    title: "Ecosystem",
    subs: [
      { id: "territory", title: "Territory" },
      { id: "ecosystem", title: "System" },
      { id: "cycle", title: "Cycle" },
      { id: "fermentation", title: "Fermentation" },
      { id: "research", title: "Research" },
      { id: "chef-daniel", title: "Chef Daniel" },
      { id: "storytelling", title: "Storytelling" },
    ],
  },

  {
    id: "menu",
    title: "Menu",
    subs: [],
  },
  {
    id: "faq",
    title: "Before you book",
    subs: [],
  },
];
