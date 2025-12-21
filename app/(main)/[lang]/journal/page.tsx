import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";
import { listJournalIndex } from "@/lib/journal/load";
import JournalClient from "./JournalClient";

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";
  const dict = await getDictionary(lang);

  return {
    title: `${dict.journal.title} | OLIVEA`,
    description: dict.journal.subtitle,
  };
}

export default async function JournalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);
  const posts = await listJournalIndex(lang);

  return (
    <JournalClient
      lang={lang}
      title={dict.journal.title}
      subtitle={dict.journal.subtitle}
      posts={posts}
    />
  );
}
