// app/(main)/[lang]/team/page.tsx
import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";
import TeamClient, { type TeamDict } from "./TeamClient";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params;
  const { dict } = await loadLocale(p);

  const maybeteam = (dict as { team?: unknown }).team;

  return {
    title: isTeamDict(maybeteam) ? maybeteam.title : "Team — OLIVEA",
    description: isTeamDict(maybeteam) ? maybeteam.description : "",
  };
}

function isTeamDict(x: unknown): x is TeamDict {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.description === "string";
}

export default async function TeamPage({ params }: PageProps) {
  const p = await params;
  const { dict } = await loadLocale(p);

  const lang: "en" | "es" = p.lang === "en" ? "en" : "es";
  const maybeteam = (dict as { team?: unknown }).team;

const team: TeamDict = isTeamDict(maybeteam)
  ? (() => {
      const mt = maybeteam as Record<string, unknown>;
      const leadersTitle = typeof mt.leadersTitle === "string" ? mt.leadersTitle : undefined;
      const leadersHint = typeof mt.leadersHint === "string" ? mt.leadersHint : undefined;
      const body =
        typeof mt.body === "string" || Array.isArray(mt.body) ? (mt.body as TeamDict["body"]) : undefined;

      return {
        ...maybeteam,
        leadersTitle: leadersTitle ?? (lang === "es" ? "Lideres de Olivea" : "Those Who Lead Olivea"),
        leadersHint,
        body,
      };
    })()
  : {
      title: lang === "es" ? "Equipo | OLIVEA" : "Team | OLIVEA",
      description: "",
      leadersTitle: lang === "es" ? "Lideres de Olivea" : "Those Who Lead Olivea",
    };
  return (
    <main className="w-full px-6 sm:px-10 py-10">
      <TeamClient lang={lang} team={team} />
    </main>
  );
}
