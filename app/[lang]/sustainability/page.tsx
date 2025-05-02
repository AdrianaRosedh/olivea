import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  // Next.js now passes params as a Promise, so we must await it
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  // Narrow the incoming string into our Lang union
  const lang: Lang = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);
  return {
    title:       dict.sustainability.title,
    description: dict.sustainability.description,
  };
}

export default async function SustainabilityPage({
  params,
}: {
  // Likewise here, params is a Promise
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang    = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">
        {dict.sustainability.title}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {dict.sustainability.description}
      </p>
    </main>
  );
}