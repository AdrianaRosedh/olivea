import type { Metadata, Viewport } from "next";
import { loadLocale }               from "@/lib/i18n";
import { supabase }                 from "@/lib/supabase";
import CafeClientPage, {
  SectionDict,
  MenuItem,
} from "./CafeClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the params promise
  const p = await params;
  // 2️⃣ Load locale + dict
  const { dict } = await loadLocale(p);

  return {
    title:       dict.cafe.title,
    description: dict.cafe.description,
  };
}

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#65735b",
};

export default async function CafePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  // 1️⃣ Await + coerce
  const p = await params;
  const { lang, dict } = await loadLocale(p);
  const cafeDict: SectionDict = dict.cafe;

  // 2️⃣ Fetch your data
  const { data, error } = await supabase
    .from("cafe_menu")
    .select("id, name, price, available, category")
    .order("category")
    .order("name");

  if (error) {
    return (
      <div className="p-8 text-red-700 bg-red-100">
        {cafeDict.error ?? "Error"}: {error.message}
      </div>
    );
  }

  // 3️⃣ Filter & group
  const available = (data ?? []).filter((i) => i.available);
  if (available.length === 0) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        {lang === "es"
          ? "No hay elementos de menú disponibles."
          : "No menu items available yet."}
      </p>
    );
  }
  const itemsByCategory: Record<string, MenuItem[]> = {};
  for (const item of available) {
    const cat = item.category ?? (lang === "es" ? "Otros" : "Others");
    (itemsByCategory[cat] ||= []).push(item);
  }

  // 4️⃣ Render client component
  return (
    <CafeClientPage
      dict={cafeDict}
      itemsByCategory={itemsByCategory}
    />
  );
}