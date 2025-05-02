import { Suspense } from "react";
import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";
import JournalEntries from "./journal-entries";

// A nicer loading skeleton while entries stream in
function JournalEntriesSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-60 bg-gray-200 rounded-xl mb-4" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

// 1️⃣ Tell Next.js which locales to prerender
export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

// 2️⃣ Build your head tags, but await the params Promise first
export async function generateMetadata({
  params,
}: {
  // params is now a Promise<{ lang: string }>
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);
  return {
    title: dict.journal.title,
    description: dict.journal.subtitle,
  };
}

// 3️⃣ Your page component also awaits params before using them
export default async function JournalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-4xl font-semibold mb-4">
        {dict.journal.title}
      </h1>
      <p className="text-muted-foreground mb-10">
        {dict.journal.subtitle}
      </p>

      <Suspense fallback={<JournalEntriesSkeleton />}>
        <JournalEntries lang={lang} />
      </Suspense>
    </main>
  );
}