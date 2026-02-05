// app/(main)/[lang]/press/page.tsx
import type { Metadata } from "next";
import PressClient from "./PressClient";
import { loadPressItems } from "./load";
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
        ? "Reconocimientos, menciones y recursos oficiales de prensa de Olivea."
        : "Awards, press mentions, and official media resources for Olivea.",
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

  return <PressClient lang={lang} items={items} />;
}
