// app/[lang]/sustainability/page.tsx
import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  // Next 15.3 now passes params as a Promise here
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the promise
  const p = await params;

  // 2️⃣ Delegate into your helper so you never read p.lang directly
  const { dict } = await loadLocale(p);

  return {
    title:       dict.sustainability.title,
    description: dict.sustainability.description,
  };
}

export default async function SustainabilityPage({
  params,
}: {
  // And here too, params is a Promise
  params: Promise<{ lang: string }>;
}) {
  // 1️⃣ Await it
  const p = await params;

  // 2️⃣ Pull in only what you need
  const { dict } = await loadLocale(p);

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