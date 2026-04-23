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
      label: { es: "Olivea Café", en: "Olivea Café" },
      href: "/cafe",
      section: "main",
      sortOrder: 2,
      visible: true,
    },
  ],
  moreLinks: [
    {
      id: "nav-journal",
      label: { es: "Journal", en: "Journal" },
      href: "/journal",
      section: "more",
      sortOrder: 0,
      visible: true,
    },
    {
      id: "nav-sustainability",
      label: { es: "Sustentabilidad", en: "Sustainability" },
      href: "/sustainability",
      section: "more",
      sortOrder: 1,
      visible: true,
    },
    {
      id: "nav-awards",
      label: { es: "Premios", en: "Awards" },
      href: "/press",
      section: "more",
      sortOrder: 2,
      visible: true,
    },
    {
      id: "nav-contact",
      label: { es: "Contáctanos", en: "Contact Us" },
      href: "/contact",
      section: "more",
      sortOrder: 3,
      visible: true,
    },
    {
      id: "nav-legal",
      label: { es: "Políticas", en: "Policies" },
      href: "/legal",
      section: "more",
      sortOrder: 4,
      visible: true,
    },
  ],
  copyright: {
    es: "© 2026 Casa Olivea AC. Todos los derechos reservados.",
    en: "© 2026 Casa Olivea AC. All rights reserved.",
  },
  seeMore: { es: "Ver Más", en: "See More" },
  hide: { es: "Ocultar", en: "Hide" },
};

export default drawer;
