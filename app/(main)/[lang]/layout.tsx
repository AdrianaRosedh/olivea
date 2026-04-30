// app/(main)/[lang]/layout.tsx
import "../main.css";

import type { Metadata, ResolvingMetadata } from "next";
import type { ReactNode } from "react";
import StructuredDataServer from "@/components/seo/StructuredDataServer";
import LayoutShell from "@/components/layout/LayoutShell";
import {
  loadLocale,
  type Lang,
  type AppDictionary,
} from "@/app/(main)/[lang]/dictionaries";
import ClientPrewarm from "./prewarm-client";
import { canonicalUrl, SITE } from "@/lib/site";

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
    lang === "es" ? "OLIVEA | Hospitalidad del Huerto" : "OLIVEA | Farm Hospitality";

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

  // Footer socials use the hardcoded fallback for now. Admin can still edit
  // global_settings.socials via /admin/content/global; wiring those edits to
  // the Footer would require an extra fetch here (which currently opts the
  // page out of SSG) or a properly cached unstable_cache wrapper.

  const isEs = lang === "es";
  const prefix = isEs ? "es" : "en";

  // ✅ SiteNavigationElement on ALL pages (not just home) for Google sitelinks
  const nav = [
    { name: "Casa Olivea", url: canonicalUrl(`/${prefix}/casa`) },
    { name: "Olivea Farm To Table", url: canonicalUrl(`/${prefix}/farmtotable`) },
    { name: "Olivea Café", url: canonicalUrl(`/${prefix}/cafe`) },
    { name: isEs ? "Filosofía" : "Philosophy", url: canonicalUrl(`/${prefix}/sustainability`) },
    { name: isEs ? "Cuaderno" : "Journal", url: canonicalUrl(`/${prefix}/journal`) },
    { name: isEs ? "Prensa" : "Press", url: canonicalUrl(`/${prefix}/press`) },
    { name: isEs ? "Contacto" : "Contact", url: canonicalUrl(`/${prefix}/contact`) },
  ];

  const navLd = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "@id": `${SITE.canonicalBaseUrl}#sitenav`,
    name: nav.map((n) => n.name),
    url: nav.map((n) => n.url),
  };

  return (
    <div data-scope="main">
      <StructuredDataServer />
      {/* ✅ Navigation schema for sitelinks */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navLd) }}
      />
      <ClientPrewarm />
      <LayoutShell lang={lang} dictionary={dict}>
        {children}
      </LayoutShell>
    </div>
  );
}
