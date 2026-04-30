// app/[lang]/legal/page.tsx
import type { Metadata, Viewport } from "next";
import { getContent, t } from "@/lib/content";
import type { Lang } from "../dictionaries";

export async function generateStaticParams(): Promise<{ lang: string }[]> {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";
  const legal = await getContent("legal");

  return {
    title: `${t(lang, legal.title)} | OLIVEA`,
    description: t(lang, legal.description),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5e7658",
  viewportFit: "cover",
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = raw === "es" ? "es" : "en";
  const legal = await getContent("legal");

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{t(lang, legal.title)}</h1>
      <p className="mt-2 text-muted-foreground">{t(lang, legal.description)}</p>
      {legal.sections?.map((section, i) => (
        <section key={i} className="mt-8">
          {section.title && (
            <h2 className="text-xl font-semibold">{t(lang, section.title)}</h2>
          )}
          {section.body && (
            <p className="mt-2 text-muted-foreground whitespace-pre-line">
              {t(lang, section.body)}
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
