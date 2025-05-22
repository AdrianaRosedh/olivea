// app/[lang]/restaurant/page.tsx
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
    title: `${dict.restaurant.title}`,
    description: dict.restaurant.description,
    metadataBase: new URL("https://oliveafarmtotable.com"),
    openGraph: {
      title: `${dict.restaurant.title}`,
      description: dict.restaurant.description,
      images: [
        {
          url: "/images/restaurant.png",
          width: 1200,
          height: 630,
          alt: "Olivea Restaurant",
        },
      ],
      locale: lang,
      type: "website",
    },
    alternates: {
      canonical: `https://oliveafarmtotable.com/${lang}/restaurant`,
      languages: {
        en: "https://oliveafarmtotable.com/en/restaurant",
        es: "https://oliveafarmtotable.com/es/restaurant",
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
        {/* Pass the full dict through, just like Cafe & Casa */}
        <RestaurantClientPage dict={dict} />
      </Suspense>
    </div>
  );
}
