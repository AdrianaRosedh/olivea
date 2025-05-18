
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale } from "@/lib/i18n";
import StructuredData from "@/components/seo/StructuredData";
import LayoutShell from "@/components/layout/LayoutShell";

// NEW! bring back all your providers:
import { ReservationProvider } from "@/contexts/ReservationContext";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import ClientProviders from "@/components/providers/ClientProviders";

// and your modal + shared transition pieces
import ReservationModal from "@/components/forms/reservation/ReservationModal";
import { SharedTransitionProvider } from "@/contexts/SharedTransitionContext";
import SharedVideoTransition from "@/components/ui/SharedVideoTransition";

interface LangLayoutProps {
  children: ReactNode;
  params: { lang: string };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const { lang, dict } = await loadLocale(p);

  return {
    title: { template: "%s | Olivea", default: "Olivea" },
    description: dict.metadata?.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title: "Olivea",
      description: dict.metadata?.description,
      images: [`/images/og-${lang}.jpg`],
      url: `https://olivea.com/${lang}`,
      type: "website",
      locale: lang,
      siteName: "Olivea",
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#65735b",
};

export default async function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  const p = await params;
  const { lang, dict } = await loadLocale(p);

  return (
    <>
      <StructuredData lang={lang} />

      <SharedTransitionProvider>
        <ReservationProvider>
          <ScrollProvider>
            <ClientProviders>
              <LayoutShell lang={lang} dictionary={dict}>
                {/* Mount the reservation modal once at the top level */}
                <ReservationModal lang={params.lang} />

                {/* All your pages, carousels, identity-cards, etc. */}
                {children}
              </LayoutShell>
            </ClientProviders>
          </ScrollProvider>
        </ReservationProvider>

        {/* This keeps your shared video transitions working */}
        <SharedVideoTransition />
      </SharedTransitionProvider>
    </>
  );
}