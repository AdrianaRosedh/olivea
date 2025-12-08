// app/(home)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import FixedLCP from "./FixedLCP";
import { SITE } from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#5a6852", // matches var(--olivea-olive)
};

export async function generateMetadata(
  { params: { lang } }: { params: { lang: "es" | "en" } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const isEs = lang === "es";

  const title = isEs
    ? "OLIVEA | Donde el huerto es la esencia"
    : "OLIVEA | Where the garden is the essence";

  const description = isEs
    ? "Olivea: restaurante de degustación, hotel y café nacidos del huerto en Valle de Guadalupe. Donde el huerto es la esencia."
    : "Olivea: a tasting-menu restaurant, boutique hotel and café rooted in a living garden in Valle de Guadalupe. Where the garden is the essence.";

  const url = isEs ? `${SITE.baseUrl}/es` : `${SITE.baseUrl}/en`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),

    alternates: {
      canonical: isEs ? "/es" : "/en",
      languages: {
        "es-MX": "/es",
        "en-US": "/en",
      },
    },

    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "OLIVEA",
      locale: isEs ? "es_MX" : "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function HomeLangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Base color LCP layer renders before page content */}
      <FixedLCP />
      {children}
    </>
  );
}
