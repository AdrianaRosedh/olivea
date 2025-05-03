// app/[lang]/restaurant/page.tsx
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { loadLocale }               from "@/lib/i18n";
import RestaurantClientPage         from "./RestaurantClientPage";

// ❗️ Tell Next.js which locales to prerender
export async function generateStaticParams() {
  const langs = ["en", "es"] as const;
  return langs.map((lang) => ({ lang }));
}

// ❗️ Build your head tags, awaiting params first
export async function generateMetadata({
  params,
}: {
  // Next.js still passes params as a Promise
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // await the Promise
  const p = await params;
  // extract + narrow
  const { lang, dict } = await loadLocale(p);

  return {
    title:       `${dict.restaurant.title} | Olivea`,
    description: dict.restaurant.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title:       `${dict.restaurant.title} | Olivea`,
      description: dict.restaurant.description,
      images: [
        {
          url:    "/images/restaurant.png",
          width:  1200,
          height: 630,
          alt:    "Olivea Restaurant",
        },
      ],
      locale: lang,
      type:   "website",
    },
    alternates: {
      canonical: `https://olivea.com/${lang}/restaurant`,
      languages: {
        en: "https://olivea.com/en/restaurant",
        es: "https://olivea.com/es/restaurant",
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

export default async function RestaurantPage({
  params,
}: {
  // still a Promise here
  params: Promise<{ lang: string }>;
}) {
  // 1) await before touching any props
  const p = await params;
  // 2) loadLocale will parse + validate your dict
  const { lang, dict } = await loadLocale(p);

  // 3) give a safe fallback shape if your JSON is missing sections
  const sections =
    dict.restaurant.sections ?? {
      story:  { title: "", description: "" },
      garden: { title: "", description: "" },
      menu:   { title: "", description: "" },
      wines:  { title: "", description: "" },
    };

  return (
    <div suppressHydrationWarning>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            {/* optional loading spinner */}
          </div>
        }
      >
        <RestaurantClientPage
          lang={lang}
          dict={{
            title:       dict.restaurant.title,
            description: dict.restaurant.description,
            sections,
          }}
        />
      </Suspense>
    </div>
  );
}