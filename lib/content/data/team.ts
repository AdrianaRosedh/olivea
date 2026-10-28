// lib/content/data/team.ts

import type { TeamContent } from "../types";

const team: TeamContent = {
  // Fallback for team_content.faq — edit in /admin/content/team.
  faq: [
    {
      "id": "faq_be51921e1d27",
      "q": {
        "es": "¿Quién es el chef de Olivea?",
        "en": "Who is the chef at Olivea?"
      },
      "a": {
        "es": "Daniel Nates es el Chef Ejecutivo de Olivea Farm To Table, el restaurante con estrella MICHELIN en Valle de Guadalupe. Dirige un menú holístico arraigado al huerto y al territorio de Baja California.",
        "en": "Daniel Nates is the Executive Chef of Olivea Farm To Table, the MICHELIN-starred restaurant in Valle de Guadalupe. He leads a garden-led holistic menu rooted in Baja California."
      }
    },
    {
      "id": "faq_872b92f76165",
      "q": {
        "es": "¿Quién fundó Olivea?",
        "en": "Who founded Olivea?"
      },
      "a": {
        "es": "Ange Joy es la fundadora y diseñadora de Olivea — dio forma a los espacios, la estética y el espíritu de bienvenida del restaurante, el hospedaje y el café.",
        "en": "Ange Joy is the founder and designer of Olivea — she shaped the spaces, the aesthetic, and the spirit of welcome across the restaurant, farm stay, and café."
      }
    },
    {
      "id": "faq_43ce4cbab76a",
      "q": {
        "es": "¿Quién es la CEO de Olivea?",
        "en": "Who is the CEO of Olivea?"
      },
      "a": {
        "es": "Adriana Rose es la CEO de Olivea (Tecnología y Visión) y la arquitecta de su ecosistema. También es la fundadora de roseiies, el estudio de inteligencia en hospitalidad detrás de la tecnología de Olivea.",
        "en": "Adriana Rose is the CEO of Olivea (Technology & Vision) and the architect of its ecosystem. She is also the founder of roseiies, the hospitality-intelligence studio behind Olivea's technology."
      }
    },
    {
      "id": "faq_d1f32653aa54",
      "q": {
        "es": "¿Qué es roseiies?",
        "en": "What is roseiies?"
      },
      "a": {
        "es": "roseiies es el estudio de inteligencia en hospitalidad y tecnología fundado por Adriana Rose, CEO de Olivea. Construye los menús vivos, el mapa del huerto y los sistemas operativos de Olivea.",
        "en": "roseiies is the hospitality-intelligence and technology studio founded by Adriana Rose, CEO of Olivea. It builds Olivea's living menus, garden map, and operational systems."
      }
    }
  ],
  meta: {
    title: {
      es: "Equipo Olivea | Hospitalidad del Huerto en Valle de Guadalupe",
      en: "Team Olivea | Farm-to-Table Hospitality in Valle de Guadalupe",
    },
    description: {
      es: "Conoce cómo Olivea lleva la luz, el suelo y los productores del Valle a la mesa — nuestro equipo, valores y enfoque de diseño en Ensenada, Baja California.",
      en: "Learn how Olivea brings the Valley's light, soil and producers to the table — our team, values and design approach in Ensenada, Baja California.",
    },
    ogImage: "/images/seo/seo-og.jpg",
    keywords: ["Olivea", "about", "Valle de Guadalupe", "team"],
  },
  title: {
    es: "Equipo",
    en: "Team",
  },
  description: {
    es: "Nuestra historia, filosofía y las personas detrás de la visión.",
    en: "Farm-to-table hospitality in Valle de Guadalupe—our story, philosophy, and the people behind the vision.",
  },
};

export default team;
