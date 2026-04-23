// app/(main)/[lang]/metadata.ts
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ lang: "es" | "en" }>;
};

export async function generateMetadata(
  { params: paramsPromise }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { lang } = await paramsPromise;
  const isEs = lang === "es";
  const title = isEs ? "OLIVEA | Hospitalidad del Huerto" : "OLIVEA | Farm Hospitality";
  const description = isEs
    ? "Olivea: hospitalidad del huerto en Valle de Guadalupe — restaurante con estrella MICHELIN, hospedaje y café nacidos del huerto."
    : "Olivea: farm hospitality in Valle de Guadalupe — MICHELIN-starred restaurant, farm stay, and café rooted in a working garden.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/images/og/cover.jpg", width: 1200, height: 630, alt: "OLIVEA" }],
    },
    alternates: {
      languages: {
        "es-MX": "/es",
        "en-US": "/en",
      },
    },
  };
}
