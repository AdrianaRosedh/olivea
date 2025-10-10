// app/(main)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata } from "next";
import type { ReactNode } from "react";
import StructuredData from "@/components/seo/StructuredData";
import LayoutShell from "@/components/layout/LayoutShell";
import { loadLocale } from "@/lib/i18n";
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import ClientPrewarm from "./prewarm-client";

type Params = { params: { lang: "es" | "en" } };

export async function generateMetadata(
  { params: { lang } }: Params,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const baseTitle = lang === "es" ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience";
  return {
    title: { default: baseTitle, template: "%s" },
    alternates: { languages: { "es-MX": "/es", "en-US": "/en" } },
    openGraph: { title: baseTitle },
  };
}

export default async function LangLayout({
  children,
  params: { lang: rawLang },
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const { lang, dict } = (await loadLocale({ lang: rawLang })) as {
    lang: Lang;
    dict: AppDictionary;
  };

  return (
    <>
      <StructuredData />
      <ClientPrewarm />
      {/* AppProviders is already in app/layout.tsx; avoid double-wrapping */}
      <LayoutShell lang={lang} dictionary={dict}>
        {children}
      </LayoutShell>
    </>
  );
}
