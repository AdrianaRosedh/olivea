import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { getDictionary, type Lang } from "../dictionaries";
import RestaurantClientPage from "./RestaurantClientPage";

// Tell Next.js which locales to prerender
export async function generateStaticParams() {
  const langs: Lang[] = ["en", "es"];
  return langs.map((l) => ({ lang: l }));
}

export async function generateMetadata({
  params,
}: {
  // Next.js 15.3 passes params as a Promise
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // Await the params promise
  const { lang: rawLang } = await params;
  // Narrow to your Lang union
  const lang: Lang = rawLang === "es" ? "es" : "en";

  // Load translations
  const dict = await getDictionary(lang);

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
  // params is a Promise here, too
  params: Promise<{ lang: string }>;
}) {
  // Await params before using it
  const { lang: rawLang } = await params;
  const lang: Lang        = rawLang === "es" ? "es" : "en";

  // Load translations
  const dict = await getDictionary(lang);

  // Fill in fallback if your JSON is missing sections
  const sections = dict.restaurant.sections ?? {
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
        <RestaurantClientPage lang={lang} sections={sections} />
      </Suspense>
    </div>
  );
}