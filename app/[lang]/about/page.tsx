// app/[lang]/about/page.tsx
import type { Metadata } from "next";
import { loadLocale }     from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1) Await the params promise
  const p = await params;
  // 2) Delegate locale‐loading to our helper
  const { dict } = await loadLocale(p);

  return {
    title:       dict.about.title,
    description: dict.about.description,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  // 1) Await & coerce exactly once
  const p = await params;
  const { dict } = await loadLocale(p);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">
        {dict.about.title}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {dict.about.description}
      </p>
    </main>
  );
}