// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { getDictionary, type Lang, type AppDictionary } from "./dictionaries";
import LayoutShell from "@/components/layout/LayoutShell";
import { ReservationProvider } from "@/contexts/ReservationContext";
import StructuredData from "@/components/StructuredData";

export async function generateMetadata({
  params,
}: {
  // Next.js now passes params as a Promise here
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the params promise
  const { lang: rawLang } = await params;
  // 2️⃣ Coerce to your Lang union
  const lang: Lang = rawLang === "es" ? "es" : "en";
  // 3️⃣ Load dictionary
  const dict: AppDictionary = await getDictionary(lang);

  return {
    title:       { template: "%s | Olivea", default: "Olivea" },
    description: dict.metadata?.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title:       "Olivea",
      description: dict.metadata?.description,
      images:      [`/images/og-${lang}.jpg`],
      url:         `https://olivea.com/${lang}`,
      type:        "website",
      locale:      lang,
      siteName:    "Olivea",
    },
    alternates: {
      canonical: `https://olivea.com/${lang}`,
      languages: {
        en: `https://olivea.com/en`,
        es: `https://olivea.com/es`,
      },
    },
  };
}

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#65735b",
};

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  // And here too, params is a Promise
  params: Promise<{ lang: string }>;
}) {
  // 1️⃣ Await the params promise
  const { lang: rawLang } = await params;
  // 2️⃣ Narrow to your union
  const lang: Lang = rawLang === "es" ? "es" : "en";
  // 3️⃣ Load dictionary
  const dict: AppDictionary = await getDictionary(lang);

  return (
    <>
      <StructuredData lang={lang} />
      <ReservationProvider lang={lang}>
        <LayoutShell lang={lang} dictionary={dict}>
          {children}
        </LayoutShell>
      </ReservationProvider>
    </>
  );
}