// app/(home)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import FixedLCP from "./FixedLCP";

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
    alternates: {
      languages: {
        "es-MX": "/es",
        "en-US": "/en",
      },
    },
    // If you have your canonical domain ready, enable this:
    // metadataBase: new URL("https://www.oliveafarmtotable.com"),
    // openGraph: { title: baseTitle, locale: lang === "es" ? "es_MX" : "en_US" },
  };
}

export default function HomeLangLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Base color LCP layer renders before page content */}
      <FixedLCP />
      {children}
    </>
  );
}
