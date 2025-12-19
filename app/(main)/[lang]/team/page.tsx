import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";
import TeamClient, { type TeamDict } from "./TeamClient";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const { dict } = await loadLocale(params);

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

export default async function TeamPage({
  params,
}: {
  params: { lang: string };
}) {
  const { dict } = await loadLocale(params);

  const lang: "en" | "es" = params.lang === "en" ? "en" : "es";
  const maybeteam = (dict as { team?: unknown }).team;

  const team: TeamDict = isTeamDict(maybeteam)
    ? maybeteam
    : {
        title: lang === "es" ? "Equipo — OLIVEA" : "Team — OLIVEA",
        description: "",
      };

  return (
    <main className="w-full px-6 sm:px-10 py-10">
      <TeamClient lang={lang} team={team} />
    </main>
  );
}