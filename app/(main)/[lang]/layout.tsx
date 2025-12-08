// app/(main)/[lang]/layout.tsx
import "../main.css";

import type { Metadata, ResolvingMetadata } from "next";
import type { ReactNode } from "react";
import StructuredData from "@/components/seo/StructuredData";
import LayoutShell from "@/components/layout/LayoutShell";
import {
  loadLocale,
  type Lang,
  type AppDictionary,
} from "@/app/(main)/[lang]/dictionaries";
import ClientPrewarm from "./prewarm-client";

// Optional but nice: prebuild both langs for this segment
export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

type LayoutParams = { params: Promise<{ lang: string }> };

export async function generateMetadata(
  { params }: LayoutParams,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { lang } = await params;
  const baseTitle =
    lang === "es" ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience";

  return {
    title: { default: baseTitle, template: "%s" },
    alternates: { languages: { "es-MX": "/es", "en-US": "/en" } },
    openGraph: { title: baseTitle },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;

  const { lang, dict } = (await loadLocale({ lang: rawLang })) as {
    lang: Lang;
    dict: AppDictionary;
  };

  return (
    <div data-scope="main">
      <StructuredData />
      <ClientPrewarm />
      <LayoutShell lang={lang} dictionary={dict}>
        {children}
      </LayoutShell>
    </div>
  );
}
