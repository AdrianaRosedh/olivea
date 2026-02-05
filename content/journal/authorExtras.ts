// content/journal/authorExtras.ts

export type AuthorExtra = {
  id: string;
  name: string;

  title?: { es: string; en: string };
  bio?: { es: string; en: string };
  image?: string;
  sameAs?: string[];
  worksFor?: string;
};

/**
 * Only authors NOT present in TEAM go here.
 * TEAM members are resolved automatically from teamData.ts
 */
export const AUTHOR_EXTRAS: Record<string, AuthorExtra> = {
  editorial: {
    id: "editorial",
    name: "Olivea Editorial",
    title: { es: "Editorial", en: "Editorial" },
    bio: {
      es: "Notas del equipo sobre decisiones, temporadas y filosofía del ecosistema Olivea.",
      en: "Team notes on decisions, seasons, and the philosophy behind the Olivea ecosystem.",
    },
    image: "/images/authors/olivea.jpg",
    worksFor: "Olivea",
    sameAs: [
      "https://www.instagram.com/oliveafarmtotable",
    ],
  },

  // Example guest author:
  // "guest-julian": {
  //   id: "guest-julian",
  //   name: "Julian García",
  //   title: { es: "Colaborador", en: "Contributor" },
  //   bio: {
  //     es: "Explora sistemas de hospitalidad y diseño de experiencia.",
  //     en: "Explores hospitality systems and experience design.",
  //   },
  //   sameAs: ["https://www.linkedin.com/in/..."],
  // },
};
