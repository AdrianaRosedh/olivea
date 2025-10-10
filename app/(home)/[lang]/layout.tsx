// app/(main)/[lang]/layout.tsx
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params: { lang } }: { params: { lang: "es" | "en" } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const baseTitle = lang === "es" ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience";

  return {
    title: {
      default: baseTitle,
      template: `%s · OLIVEA`, // child pages can set "Casa Olivea" -> "Casa Olivea · OLIVEA"
    },
    alternates: {
      languages: {
        "es-MX": "/es",
        "en-US": "/en",
      },
    },
    // optional but nice:
    // metadataBase: new URL("https://www.oliveafarmtotable.com"),
    // openGraph: { title: baseTitle, locale: lang === "es" ? "es_MX" : "en_US" },
  };
}

export default function LangLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
