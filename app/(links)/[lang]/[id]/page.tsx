import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TEAM, type LeaderProfile } from "@/app/(main)/[lang]/team/teamData";

export const dynamicParams = false;

export async function generateStaticParams() {
  const langs = ["es", "en"] as const;
  return TEAM.flatMap((m) => langs.map((lang) => ({ lang, id: m.id })));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: "es" | "en"; id: string };
}): Promise<Metadata> {
  const member = TEAM.find((m: LeaderProfile) => m.id === params.id);
  if (!member) return {};
  return {
    title: `${member.name} — OLIVEA`,
    description: member.role?.[params.lang] ?? "OLIVEA",
  };
}

export default function LinktreePage({
  params,
}: {
  params: { lang: "es" | "en"; id: string };
}) {
  const member = TEAM.find((m: LeaderProfile) => m.id === params.id);
  if (!member) return notFound();

  return (
    <main className="min-h-screen px-5 py-10 flex items-start justify-center">
      <div className="w-full max-w-[520px]">
        <h1 className="text-3xl font-semibold text-(--olivea-olive)">
          {member.name}
        </h1>
        <p className="mt-2 text-(--olivea-clay)">
          {member.role?.[params.lang] ?? ""}
          console.log("✅ HIT (links)/[lang]/[id]");
        </p>
      </div>
    </main>
  );
}
