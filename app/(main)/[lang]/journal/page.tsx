// app/(main)/[lang]/journal/page.tsx
import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";
import { listJournalIndex, type JournalIndexItem } from "@/lib/journal/load";
import JournalClient from "./JournalClient";
import { SITE } from "@/lib/site";

export const revalidate = 60;

/* ------------------ safe dict helpers (no any) ------------------ */

type UnknownRecord = Record<string, unknown>;

function isRecord(x: unknown): x is UnknownRecord {
  return !!x && typeof x === "object";
}

function getString(obj: unknown, key: string): string | undefined {
  if (!isRecord(obj)) return undefined;
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function getNested(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

function readJournalMeta(dict: unknown) {
  const journal = getNested(dict, "journal");
  const meta = getNested(journal, "meta");

  const title = getString(journal, "title");
  const subtitle = getString(journal, "subtitle");
  const ogImage = getString(meta, "ogImage");

  const metadata = getNested(dict, "metadata");
  const ogDefault = getString(metadata, "ogDefault");

  return { title, subtitle, ogImage, ogDefault };
}

/* ------------------ next ------------------ */

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

  const jm = readJournalMeta(dict);

  const title = `${jm.title ?? "Journal"} | Olivea`;
  const description =
    jm.subtitle ??
    (lang === "es"
      ? "Artículos, notas y decisiones del ecosistema Olivea."
      : "Articles, field notes, and decisions from the Olivea ecosystem.");

  const path = `/${lang}/journal`;
  const canonical = `${SITE.baseUrl}${path}`;

  const ogImage = jm.ogImage ?? jm.ogDefault ?? "/images/seo/journal-og.jpg";
  const ogLocale = lang === "es" ? "es_MX" : "en_US";

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),

    robots: { index: true, follow: true },

    alternates: {
      canonical: path,
      languages: {
        es: "/es/journal",
        en: "/en/journal",
      },
    },

    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Olivea",
      locale: ogLocale,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
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
  const jm = readJournalMeta(dict);

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
      title={jm.title ?? (lang === "es" ? "Journal" : "Journal")}
      subtitle={
        jm.subtitle ??
        (lang === "es"
          ? "Artículos, notas y decisiones del ecosistema Olivea."
          : "Articles, field notes, and decisions from the Olivea ecosystem.")
      }
      posts={posts}
    />
  );
}
