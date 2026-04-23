// lib/content/data/sustainabilitySections.ts
// Philosophy/Sustainability page sections — extracted from MDX files
// so they can be edited from admin without touching MDX.
//
// Currently loads the canonical text from the MDX frontmatter.
// When wired to admin, each section's title, subtitle, signals,
// practices, and body become editable fields.

import type { SustainabilitySection } from "../types";

const items: SustainabilitySection[] = [
  {
    id: "origins",
    order: 1,
    title: { es: "Orígenes", en: "Origins" },
    subtitle: {
      es: "Cuando una idea tranquila pidió más.",
      en: "When a quiet idea asked for more.",
    },
    signals: [
      { es: "Verano tardío 2023", en: "Late summer 2023" },
      { es: "Un sistema familiar", en: "A family system" },
      { es: "Urgencia como alineación", en: "Urgency as alignment" },
    ],
    practices: [
      {
        es: "Decisiones de diseño arraigadas en la realidad operativa",
        en: "Design decisions grounded in operational reality",
      },
      {
        es: "Cultura tratada como infraestructura",
        en: "Culture treated as infrastructure",
      },
      {
        es: "Claridad antes que expansión",
        en: "Clarity before expansion",
      },
      {
        es: "Estándares construidos para durar",
        en: "Standards built to last",
      },
    ],
    body: {
      es: "", // MDX body loaded separately
      en: "",
    },
  },
  {
    id: "vision",
    order: 2,
    title: { es: "Visión", en: "Vision" },
    subtitle: {
      es: "Lo que guía las decisiones.",
      en: "What guides the decisions.",
    },
    body: { es: "", en: "" },
  },
  {
    id: "sustainability",
    order: 3,
    title: { es: "Sustentabilidad", en: "Sustainability" },
    subtitle: {
      es: "Sistemas, no gestos.",
      en: "Systems, not gestures.",
    },
    body: { es: "", en: "" },
  },
  {
    id: "technology",
    order: 4,
    title: { es: "Tecnología", en: "Technology" },
    subtitle: {
      es: "Herramientas al servicio de la claridad.",
      en: "Tools in service of clarity.",
    },
    body: { es: "", en: "" },
  },
  {
    id: "gastronomy",
    order: 5,
    title: { es: "Gastronomía", en: "Gastronomy" },
    subtitle: {
      es: "El plato como expresión del territorio.",
      en: "The plate as an expression of territory.",
    },
    body: { es: "", en: "" },
  },
  {
    id: "community",
    order: 6,
    title: { es: "Comunidad", en: "Community" },
    subtitle: {
      es: "La mesa se extiende.",
      en: "The table extends.",
    },
    body: { es: "", en: "" },
  },
];

export default items;
export { items };
