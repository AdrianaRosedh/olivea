import type { Metadata, Viewport } from "next";
import { getDictionary } from "./dictionaries";
import LayoutShell from "@/components/layout/LayoutShell";
import { ReservationProvider } from "@/contexts/ReservationContext";
import StructuredData from "@/components/StructuredData";

// Generate metadata for each locale, awaiting params Promise
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: { template: "%s | Olivea", default: "Olivea" },
    description:
      dict.metadata?.description ||
      "A farm-to-table sanctuary where nature, nourishment, and design meet.",
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title: "Olivea",
      description:
        dict.metadata?.description ||
        "A farm-to-table sanctuary where nature, nourishment, and design meet.",
      images: [`/images/og-${lang}.jpg`],
      url: `https://olivea.com/${lang}`,
      type: "website",
      locale: lang,
      siteName: "Olivea",
    },
    alternates: {
      canonical: `https://olivea.com/${lang}`,
      languages: { en: "https://olivea.com/en", es: "https://olivea.com/es" },
    },
  };
}

// Viewport settings per locale
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#65735b",
};

// Locale-specific layout: await params Promise before use
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

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