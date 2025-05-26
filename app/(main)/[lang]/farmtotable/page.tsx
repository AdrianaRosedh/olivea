// app/[lang]/farmtotable/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale } from "@/lib/i18n";
import RestaurantClientPage from "./RestaurantClientPage";

// Tell Next.js which locales to prerender
export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }));
}

// Build your head tags, awaiting params first
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang, dict } = await loadLocale(await params);

  return {
    title: dict.farmtotable.title,
    description: dict.farmtotable.description,
    metadataBase: new URL("https://wwww.oliveafarmtotable.com"),
    openGraph: {
      title: dict.farmtotable.title,
      description: dict.farmtotable.description,
      images: [
        {
          url: "/images/farmtotable.png",
          width: 1200,
          height: 630,
          alt: "Olivea Farm To Table",
        },
      ],
      locale: lang,
      type: "website",
    },
    alternates: {
      canonical: `https://www.oliveafarmtotable.com/${lang}/farmtotable`,
      languages: {
        en: "https://www.oliveafarmtotable.com/en/farmtotable",
        es: "https://www.oliveafarmtotable.com/es/farmtotable",
      },
    },

    // ← preload the Restaurant identity clip
    other: {
      preload: [
        '<link rel="preload" href="/videos/farmtotable.webm" as="video" type="video/webm" />',
        '<link rel="preload" href="/videos/farmtotable.mp4"  as="video" type="video/mp4"  />',
      ],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#65735b",
};

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { dict } = await loadLocale(await params);

  return (
    <div suppressHydrationWarning>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            {/* optional loading spinner */}
          </div>
        }
      >
        {/* Pass the full dict */}
        <RestaurantClientPage dict={dict} />
      </Suspense>
    </div>
  );
}