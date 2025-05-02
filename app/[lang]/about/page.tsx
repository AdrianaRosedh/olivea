// app/[lang]/about/page.tsx
import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  // Next.js 15.3+ hands you params as a Promise
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the params then coerce into our Lang union
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "es" ? "es" : "en";

  // 2️⃣ Load translations
  const dict = await getDictionary(lang);

  return {
    title:       dict.about.title,
    description: dict.about.description,
  };
}

export default async function AboutPage({
  params,
}: {
  // Also a Promise here
  params: Promise<{ lang: string }>;
}) {
  // 1️⃣ Await & coerce
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "es" ? "es" : "en";

  // 2️⃣ Load translations
  const dict = await getDictionary(lang);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.about.title}</h1>
      <p className="mt-2 text-muted-foreground">
        {dict.about.description}
      </p>
    </main>
  );
}