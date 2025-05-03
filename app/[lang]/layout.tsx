// app/[lang]/layout.tsx
import React, { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale }               from "@/lib/i18n";
import StructuredData               from "@/components/seo/StructuredData";
import LayoutShell                  from "@/components/layout/LayoutShell";
import { ReservationProvider }      from "@/contexts/ReservationContext";
import { ScrollProvider }           from "@/components/providers/ScrollProvider";
import ClientProviders              from "@/components/providers/ClientProviders";

export async function generateMetadata({
  params,
}: {
  // NOTE: generateMetadata still receives params as a Promise
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the promise…
  const p = await params;
  // 2️⃣ …then delegate into your helper (never read p.lang yourself!)
  const { lang, dict } = await loadLocale(p);

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
  // page component also gets params as a Promise
  params: Promise<{ lang: string }>;
}) {
  // 1️⃣ Await params…
  const p = await params;
  // 2️⃣ …then load your dict
  const { lang, dict } = await loadLocale(p);

  return (
    <>
      {/* 1) SEO + JSON-LD */}
      <StructuredData lang={lang} />

      {/* 2) Reservation context + modal */}
      <ReservationProvider lang={lang}>
        {/* 3) Smooth-scroll context */}
        <ScrollProvider>
          {/* 4) Purely client-only bits (background, audio, etc.) */}
          <ClientProviders>
            {/* 5) Your actual shell (Navbar, Footer, etc.) */}
            <LayoutShell lang={lang} dictionary={dict}>
              {children}
            </LayoutShell>
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>
    </>
  );
}