// app/(main)/[lang]/team/page.tsx
import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";
import TeamClient, { type TeamDict } from "./TeamClient";

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

  return {
    title: withBrand(baseTitle),
    description,
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

  return (
    <main className="w-full px-6 sm:px-10 py-10">
      <TeamClient lang={lang} team={team} />
    </main>
  );
}
