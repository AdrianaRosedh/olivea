// app/(main)/[lang]/layout.tsx
"use client";

import { Suspense, useState, useEffect, ReactNode } from "react";
import StructuredData from "@/components/seo/StructuredData";
import LayoutShell from "@/components/layout/LayoutShell";
import { AppProviders } from "@/app/providers";  // ← global contexts + modal wiring
import { loadLocale } from "@/lib/i18n";
import { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";

export default function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: Lang };
}) {
  const [langData, setLangData] = useState<{ lang: Lang; dict: AppDictionary } | null>(null);

  useEffect(() => {
    loadLocale(params).then(setLangData);
  }, [params]);

  if (!langData) return <div>Loading…</div>;
  const { lang, dict } = langData;

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <StructuredData lang={lang} />

      <AppProviders>
        <LayoutShell lang={lang} dictionary={dict}>
          {children}
        </LayoutShell>
      </AppProviders>
    </Suspense>
  );
}
