// app/(main)/[lang]/team/page.tsx
import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";
import { SITE, canonicalUrl } from "@/lib/site";
import TeamClient, { type TeamDict } from "./TeamClient";
import { loadTeam } from "./teamData";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";

type PageProps = {
  params: Promise<{ lang: string }>;
};

function isTeamDict(x: unknown): x is TeamDict {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.description === "string";
}

function withBrand(title: string) {
  // Prevent double-branding if a translator already wrote “— Olivea / OLIVEA”
  const t = title.trim();
  if (/\bolivea\b/i.test(t)) return t;
  return `${t} | OLIVEA`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params;
  const { dict } = await loadLocale(p);
  const lang: "en" | "es" = p.lang === "en" ? "en" : "es";

  const maybeteam = (dict as { team?: unknown }).team;

  const baseTitle = isTeamDict(maybeteam)
    ? maybeteam.title
    : lang === "es"
      ? "Equipo"
      : "Team";

  const description = isTeamDict(maybeteam) ? maybeteam.description : "";

  const title = withBrand(baseTitle);
  const path = `/${lang}/team`;
  const url = canonicalUrl(path);
  const isEs = lang === "es";

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: url,
      languages: { es: canonicalUrl("/es/team"), en: canonicalUrl("/en/team") },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
    },
  };
}

export default async function TeamPage({ params }: PageProps) {
  const p = await params;
  const { dict } = await loadLocale(p);

  const lang: "en" | "es" = p.lang === "en" ? "en" : "es";
  const maybeteam = (dict as { team?: unknown }).team;

  const team: TeamDict = isTeamDict(maybeteam)
    ? (() => {
        const mt = maybeteam as Record<string, unknown>;
        const leadersTitle =
          typeof mt.leadersTitle === "string" ? mt.leadersTitle : undefined;
        const leadersHint =
          typeof mt.leadersHint === "string" ? mt.leadersHint : undefined;
        const body =
          typeof mt.body === "string" || Array.isArray(mt.body)
            ? (mt.body as TeamDict["body"])
            : undefined;

        return {
          ...(maybeteam as TeamDict),
          leadersTitle:
            leadersTitle ??
            (lang === "es" ? "Líderes de Olivea" : "Leaders of Olivea"),
          leadersHint,
          body,
        };
      })()
    : {
        title: lang === "es" ? "Equipo" : "Team",
        description: "",
        leadersTitle: lang === "es" ? "Líderes de Olivea" : "Leaders of Olivea",
      };

  const members = await loadTeam();

  // ✅ Entity FAQ — the exact "who is X" questions AI gets, answered from our facts.
  const faqId = canonicalUrl(`/${lang}/team#faq`);
  const faq: FaqItem[] =
    lang === "es"
      ? [
          { q: "¿Quién es el chef de Olivea?", a: "Daniel Nates es el Chef Ejecutivo de Olivea Farm To Table, el restaurante con estrella MICHELIN en Valle de Guadalupe. Dirige un menú degustación arraigado al huerto y al territorio de Baja California." },
          { q: "¿Quién fundó Olivea?", a: "Ange Joy es la fundadora y diseñadora de Olivea — dio forma a los espacios, la estética y el espíritu de bienvenida del restaurante, el hospedaje y el café." },
          { q: "¿Quién es la CEO de Olivea?", a: "Adriana Rose es la CEO de Olivea (Tecnología y Visión) y la arquitecta de su ecosistema. También es la fundadora de roseiies, el estudio de inteligencia en hospitalidad detrás de la tecnología de Olivea." },
          { q: "¿Qué es roseiies?", a: "roseiies es el estudio de inteligencia en hospitalidad y tecnología fundado por Adriana Rose, CEO de Olivea. Construye los menús vivos, el mapa del huerto y los sistemas operativos de Olivea." },
        ]
      : [
          { q: "Who is the chef at Olivea?", a: "Daniel Nates is the Executive Chef of Olivea Farm To Table, the MICHELIN-starred restaurant in Valle de Guadalupe. He leads a garden-led tasting menu rooted in Baja California." },
          { q: "Who founded Olivea?", a: "Ange Joy is the founder and designer of Olivea — she shaped the spaces, the aesthetic, and the spirit of welcome across the restaurant, farm stay, and café." },
          { q: "Who is the CEO of Olivea?", a: "Adriana Rose is the CEO of Olivea (Technology & Vision) and the architect of its ecosystem. She is also the founder of roseiies, the hospitality-intelligence studio behind Olivea's technology." },
          { q: "What is roseiies?", a: "roseiies is the hospitality-intelligence and technology studio founded by Adriana Rose, CEO of Olivea. It builds Olivea's living menus, garden map, and operational systems." },
        ];

  return (
    <main className="w-full px-6 sm:px-10 py-10">
      <FaqJsonLd id={faqId} items={faq} />
      <TeamClient lang={lang} team={team} members={members} />
    </main>
  );
}
