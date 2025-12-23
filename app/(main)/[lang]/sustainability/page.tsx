import type { Metadata } from "next";
import PhilosophyClient from "./PhilosophyClient";
import { loadPhilosophySections } from "./load";
import type { Lang } from "./philosophyTypes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";

  return {
    title: lang === "es" ? "Filosofía | OLIVEA" : "Philosophy | OLIVEA",
    description:
      lang === "es"
        ? "La filosofía de Olivea: origen, identidad, eficiencia, innovación, gastronomía y comunidad."
        : "Olivea’s philosophy: origins, identity, efficiency, innovation, gastronomy, and community.",
  };
}

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";
  const sections = loadPhilosophySections(lang);

  return <PhilosophyClient lang={lang} sections={sections} />;
}