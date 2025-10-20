// app/(home)/[lang]/metadata.ts
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { lang: "es" | "en" };
};

export async function generateMetadata(
  { params: { lang } }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const title = lang === "es" ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience";

  return {
    title,
    openGraph: { title },
    alternates: {
      languages: {
        "es-MX": "/es",
        "en-US": "/en",
      },
    },
  };
}
