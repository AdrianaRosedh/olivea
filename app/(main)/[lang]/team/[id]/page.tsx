import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeader } from "../teamData";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: { lang: "es" | "en"; id: string };
}): Promise<Metadata> {
  const member = getLeader(params.id);
  if (!member) return {};
  return {
    title: `${member.name} — OLIVEA`,
    description: member.role?.[params.lang] ?? "OLIVEA",
  };
}

export default function TeamProfilePage({
  params,
}: {
  params: { lang: "es" | "en"; id: string };
}) {
  const member = getLeader(params.id);
  if (!member) return notFound();

  return (
    <main className="w-full px-6 sm:px-10 py-10">
      <div className="mx-auto w-full max-w-[820px]">
        <h1 className="text-3xl md:text-4xl font-semibold text-(--olivea-ink)" style={{ fontFamily: "var(--font-serif)" }}>
          {member.name}
        </h1>
        <p className="mt-2 text-(--olivea-ink)/70">
          {member.role?.[params.lang]} · {member.org?.[params.lang] ?? ""}
        </p>
        <p className="mt-6 text-(--olivea-ink)/80 leading-relaxed">
          {member.bio?.[params.lang] ?? (params.lang === "es"
            ? "Historia en desarrollo — pronto."
            : "Story in progress — coming soon.")}
        </p>
      </div>
    </main>
  );
}