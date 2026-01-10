// app/(main)/[lang]/journal/page.tsx
import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";
import { listJournalIndex, type JournalIndexItem } from "@/lib/journal/load";
import JournalClient from "./JournalClient";

export const revalidate = 60;

const SITE_URL = "https://www.oliveafarmtotable.com";

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

  const title = `${dict.journal.title} | OLIVEA`;
  const description = dict.journal.subtitle;

  const path = `/${lang}/journal`;
  const canonical = `${SITE_URL}${path}`;

  return {
    title,
    description,

    // ✅ Make indexing unambiguous
    robots: { index: true, follow: true },

    // ✅ Canonical + hreflang
    alternates: {
      canonical,
      languages: {
        es: `${SITE_URL}/es/journal`,
        en: `${SITE_URL}/en/journal`,
      },
    },

    openGraph: {
      type: "website",
      url: canonical,
      siteName: "OLIVEA",
      title,
      description,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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

  // ✅ typed, resilient
  let posts: JournalIndexItem[] = [];
  try {
    posts = await listJournalIndex(lang);
  } catch (err) {
    console.error(`[journal] Failed to list journal index for ${lang}`, err);
    posts = [];
  }

  return (
    <JournalClient
      lang={lang}
      title={dict.journal.title}
      subtitle={dict.journal.subtitle}
      posts={posts}
    />
  );
}
