// app/(home)/[lang]/page.tsx
import type { Metadata } from "next";
import { SITE, canonicalUrl } from "@/lib/site";
import HomeClient from "./HomeClient";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";

  const title = isEs
    ? "OLIVEA | Donde el huerto es la esencia"
    : "OLIVEA | Where the garden is the essence";

  const description = isEs
    ? "Restaurante de degustación, hotel boutique y café de especialidad nacidos del huerto en Valle de Guadalupe, Baja California."
    : "Tasting restaurant, boutique hotel, and specialty café born from the garden in Valle de Guadalupe, Baja California.";

  const canonicalPath = isEs ? "/es" : "/en";

  return {
    title,
    description,
    metadataBase: new URL(SITE.canonicalBaseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: { en: "/en", es: "/es" },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl(canonicalPath),
      locale: isEs ? "es_MX" : "en_US",
      type: "website",
      siteName: "OLIVEA",
      images: [
        {
          url: canonicalUrl("/images/og/cover.jpg"),
          width: 1200,
          height: 630,
          alt: "OLIVEA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonicalUrl("/images/og/cover.jpg")],
    },
  };
}

export default function Page() {
  return <HomeClient />;
}
