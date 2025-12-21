import PressClient from "./PressClient";
import { loadPressItems } from "./load";
import type { Lang } from "./pressTypes";

export default async function PressPage({ params }: { params: Promise<{ lang: string }> }) {
  const p = await params;
  const lang: Lang = p.lang === "en" ? "en" : "es";
  const items = loadPressItems(lang);
  return <PressClient lang={lang} items={items} />;
}
