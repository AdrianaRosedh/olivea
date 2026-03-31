// app/(main)/[lang]/press/page.tsx
import type { Metadata } from "next";
import PressClient from "./PressClient";
import { loadPressItems, loadPressManifest } from "./load";
import type { Lang } from "./pressTypes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";

  return {
    title: lang === "es" ? "Prensa | OLIVEA" : "Press | OLIVEA",
    description:
      lang === "es"
        ? "Reconocimientos, menciones en medios y recursos oficiales de prensa de Olivea — hospitalidad del huerto, restaurante con estrella MICHELIN y hospedaje en Valle de Guadalupe."
        : "Awards, media coverage, and official press resources for Olivea — farm hospitality, MICHELIN-starred restaurant, and farm stay in Valle de Guadalupe.",
  };
}

export default async function PressPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";

  const items = loadPressItems(lang);
  const manifest = loadPressManifest();

  return <PressClient lang={lang} items={items} manifest={manifest} />;
}