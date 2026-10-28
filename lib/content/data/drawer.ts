// lib/content/data/drawer.ts
// Navigation drawer content

import type { DrawerContent } from "../types";

const drawer: DrawerContent = {
  mainLinks: [
    {
      id: "nav-ftt",
      label: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
      href: "/farmtotable",
      section: "main",
      sortOrder: 0,
      visible: true,
    },
    {
      id: "nav-casa",
      label: { es: "Casa Olivea", en: "Casa Olivea" },
      href: "/casa",
      section: "main",
      sortOrder: 1,
      visible: true,
    },
    {
      id: "nav-cafe",
      label: { es: "Olivea Café Wine Bar", en: "Olivea Café Wine Bar" },
      href: "/cafe",
      section: "main",
      sortOrder: 2,
      visible: true,
    },
  ],
  moreLinks: [
    {
      id: "nav-press",
      label: { es: "Prensa", en: "Press" },
      href: "/press",
      section: "more",
      sortOrder: 0,
      visible: true,
    },
    {
      id: "nav-sustainability",
      label: { es: "Filosofía", en: "Philosophy" },
      href: "/sustainability",
      section: "more",
      sortOrder: 1,
      visible: true,
    },
    {
      id: "nav-journal",
      label: { es: "Cuaderno", en: "Journal" },
      href: "/journal",
      section: "more",
      sortOrder: 2,
      visible: true,
    },
    {
      id: "nav-team",
      label: { es: "Equipo", en: "Team" },
      href: "/team",
      section: "more",
      sortOrder: 3,
      visible: true,
    },
    {
      id: "nav-contact",
      label: { es: "Contáctanos", en: "Contact" },
      href: "/contact",
      section: "more",
      sortOrder: 4,
      visible: true,
    },
    {
      id: "nav-careers",
      label: { es: "Carreras", en: "Careers" },
      href: "/carreras",
      section: "more",
      sortOrder: 5,
      visible: true,
    },
  ],
  // {year} is filled with the current year when shown.
  copyright: {
    es: "© {year} Inmobiliaria MYA by DH. Todos los derechos reservados.",
    en: "© {year} Inmobiliaria MYA by DH. All rights reserved.",
  },
  seeMore: { es: "Ver Más", en: "See More" },
  hide: { es: "Ocultar", en: "Hide" },
};

export default drawer;
