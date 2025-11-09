// app/(home)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import FixedLCP from "./FixedLCP";
import { SITE } from "@/lib/site"; // ⬅️ import the centralized site config

export const viewport: Viewport = {
  themeColor: "#5a6852", // matches var(--olivea-olive)
};

export async function generateMetadata(
  { params: { lang } }: { params: { lang: "es" | "en" } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const baseTitle =
    lang === "es" ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience";

  return {
    title: {
      default: baseTitle,
      template: `%s · OLIVEA`,
    },
    // Centralized base URL (no hard-coded domains)
    metadataBase: new URL(SITE.baseUrl),
    alternates: {
      languages: {
        "es-MX": "/es",
        "en-US": "/en",
      },
    },
    openGraph: {
      title: baseTitle,
      locale: lang === "es" ? "es_MX" : "en_US",
      type: "website",
      url: SITE.baseUrl,
      siteName: "OLIVEA",
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