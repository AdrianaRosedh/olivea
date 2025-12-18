import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";
import TeamClient, { type TeamDict } from "./TeamClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const { dict } = await loadLocale(p);

  // narrow safely without `any`
  const maybeteam = (dict as { team?: unknown }).team;

  return {
    title:
      isTeamDict(maybeteam)
        ? maybeteam.title
        : "team — Olivea",
    description:
      isTeamDict(maybeteam)
        ? maybeteam.description
        : "",
  };
}

function isTeamDict(x: unknown): x is TeamDict {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.description === "string";
}

export default async function teamPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const { dict } = await loadLocale(p);

  const lang = p.lang === "en" ? "en" : "es";

  // narrow once, pass cleanly to client
  const maybeteam = (dict as { team?: unknown }).team;

  const team: TeamDict = isTeamDict(maybeteam)
    ? maybeteam
    : {
        title: lang === "es" ? "Acerca de OLIVEA" : "team OLIVEA",
        description: "",
      };

  return (
    <main className="w-full px-6 sm:px-10 py-10">
      <TeamClient lang={lang} team={team} />
    </main>
  );
}