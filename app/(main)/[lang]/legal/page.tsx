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

  const sections = (legal.sections ?? [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <main className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <header className="mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-(--olivea-olive)">
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight text-(--olivea-ink)">
          {t(lang, legal.title)}
        </h1>
        <p className="mt-4 text-sm text-(--olivea-ink)/60 leading-relaxed">
          {t(lang, legal.description)}
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((s, i) => {
          const title = s.title ? t(lang, s.title) : "";
          const body = s.body ? t(lang, s.body) : "";
          const isGroupHeading = title && !body.trim();

          if (isGroupHeading) {
            return (
              <h2
                key={s.id ?? i}
                className="mt-6 border-t border-(--olivea-olive)/15 pt-8 font-serif text-2xl md:text-3xl text-(--olivea-ink)"
              >
                {title}
              </h2>
            );
          }

          return (
            <section key={s.id ?? i} className="scroll-mt-24">
              {title && (
                <h3 className="font-serif text-lg md:text-xl text-(--olivea-olive)">
                  {title}
                </h3>
              )}
              {body && (
                <p className="mt-2 text-[15px] text-(--olivea-ink)/75 leading-7 whitespace-pre-line">
                  {body}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
