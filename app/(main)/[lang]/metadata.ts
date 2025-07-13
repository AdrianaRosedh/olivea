// app/(home)/[lang]/metadata.ts
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: "es" | "en" };
}): Promise<Metadata> {
  const { lang } = params;

  // Our richer, combined description:
  const fullDescription =
    lang === "es"
      ? "Familia Olivea en Valle de Guadalupe: Olivea Farm To Table ofrece cocina de la granja a la mesa; Casa Olivea es un hotel boutique campestre; Olivea Café sirve café artesanal y repostería. Ubicado en Baja California, México."
      : "Familia Olivea in Valle de Guadalupe: Olivea Farm To Table delivers farm-fresh Baja cuisine; Casa Olivea is a boutique country inn; Olivea Café serves artisanal coffee & pastries. Located in Baja California, México.";

  return {
    title: lang === "es" ? "Familia Olivea" : "Olivea Family",
    description: fullDescription,
    alternates: {
      canonical: `https://www.oliveafarmtotable.com/${lang}`,
      languages: {
        en: "https://www.oliveafarmtotable.com/en",
        es: "https://www.oliveafarmtotable.com/es",
      },
    },
    openGraph: {
      title: "Olivea Farm to Table",
      description: fullDescription,              // ← also update here
      url: `https://www.oliveafarmtotable.com/${lang}`,
      locale: lang,
      siteName: "Familia Olivea",
      images: [
        `/images/og-${lang}.jpg`,
        "/images/og-default.jpg",
      ],
    },
  };
}
