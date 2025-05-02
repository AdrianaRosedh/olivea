import type { Metadata, Viewport } from "next";
import { getDictionary, type Lang } from "../dictionaries";

export async function generateStaticParams() {
  // Next.js will statically generate these two locales
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata({
  params,
}: {
  // In Next.js 15.3+, params is a Promise you must await
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);
  return {
    title:       `${dict.legal.title} | Olivea`,
    description: dict.legal.description,
  };
}

// (Optional) if you want to control viewport metadata here
export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#65735b",
};

export default async function LegalPage({
  params,
}: {
  // Likewise, await here
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";

  const dict = await getDictionary(lang);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.legal.title}</h1>
      <p className="mt-2 text-muted-foreground">
        {dict.legal.description}
      </p>
    </main>
  );
}