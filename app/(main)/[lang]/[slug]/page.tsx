// app/(main)/[lang]/[slug]/page.tsx
import { redirect, notFound } from "next/navigation";
import { getLeader, type Lang } from "../team/teamData";

export default function ShortProfileRedirect({
  params,
}: {
  params: { lang: Lang; slug: string };
}) {
  const lang: Lang = params.lang === "es" ? "es" : "en";
  const slug = params.slug;

  const leader = getLeader(slug);
  if (!leader) notFound();

  redirect(`/${lang}/team/${leader.id}`);
}
