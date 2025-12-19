// app/(linktree)/[lang]/team/[id]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  TEAM,
  getLeader,
  type Lang,
} from "@/app/(main)/[lang]/team/teamData";

import LinktreeClient from "./LinktreeClient";

// Keep this ON while you're iterating to avoid build-time weirdness.
// Once you're happy, you can switch to false + generateStaticParams.
export const dynamicParams = true;

export function generateStaticParams() {
  const langs: readonly Lang[] = ["es", "en"];
  return TEAM.flatMap((m) => langs.map((lang) => ({ lang, id: m.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;

  const member = getLeader(id);
  if (!member) return {};

  const desc = member.bio?.[lang] ?? member.role?.[lang] ?? "OLIVEA";

  return {
    title: `${member.name} — OLIVEA`,
    description: desc,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Lang; id: string }>;
}) {
  const { lang, id } = await params;

  const member = getLeader(id);
  if (!member) return notFound();

  return <LinktreeClient lang={lang} member={member} />;
}
