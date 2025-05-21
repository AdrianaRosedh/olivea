// app/[lang]/casa/page.tsx
import type { Metadata, Viewport } from "next";
import { loadLocale }               from "@/lib/i18n";
import CasaClientPage               from "./CasaClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the params promise
  const p = await params;
  // 2️⃣ Delegate locale+dict loading
  const { lang, dict } = await loadLocale(p);

  return {
    title:       `${dict.casa.title}`,
    description: dict.casa.description,
    metadataBase: new URL("https://oliveafarmtotable.com"),
    openGraph: {
      title:       `${dict.casa.title}`,
      description: dict.casa.description,
      images: [{
        url:   "/images/casa.png",
        width: 1200,
        height: 630,
        alt:   "Casa",
      }],
      locale: lang,
      type:   "website",
    },
    alternates: {
      canonical: `https://oliveafarmtotable.com/${lang}/casa`,
      languages: {
        en: `https://oliveafarmtotable.com/en/casa`,
        es: `https://oliveafarmtotable.com/es/casa`,
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

export default async function CasaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  // 1️⃣ Await params
  const p = await params;
  // 2️⃣ Pull in dictionary only
  const { dict } = await loadLocale(p);

  // 3️⃣ Hand off to client component
  return <CasaClientPage dict={dict} />;
}