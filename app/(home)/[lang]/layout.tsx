// app/(home)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import FixedLCP from "./FixedLCP";
import { SITE } from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#5a6852",
};

export async function generateMetadata(
  { params: { lang } }: { params: { lang: "es" | "en" } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const isEs = lang === "es";

  const title = isEs ? "OLIVEA La Experiencia" : "OLIVEA The Experience";

  const description = isEs
    ? "Olivea: restaurante de degustación, hotel y café nacidos del huerto en Valle de Guadalupe. Donde el huerto es la esencia."
    : "Olivea: a tasting-menu restaurant, boutique hotel and café rooted in a living garden in Valle de Guadalupe. Where the garden is the essence.";

  // ✅ You said Spanish is default at "/"
  const canonicalPath = isEs ? "/" : "/en";
  const url = `${SITE.baseUrl}${canonicalPath}`;

  // ✅ OG image (absolute URL)
  const ogImage = `${SITE.baseUrl}/images/og/cover.jpg`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.baseUrl),

    alternates: {
      canonical: canonicalPath,
      languages: {
        "es-MX": "/",
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
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
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
      <FixedLCP />
      {children}
    </>
  );
}