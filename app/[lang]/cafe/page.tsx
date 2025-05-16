// app/[lang]/cafe/page.tsx
import type { Lang } from "@/app/[lang]/dictionaries";
import { getDictionary } from "@/app/[lang]/dictionaries";
import CafeClientPage from "./CafeClientPage";
import { supabase } from "@/lib/supabase";

export default async function CafePage({ params }: { params: { lang: Lang } }) {
  const dict = await getDictionary(params.lang);

  const { data, error } = await supabase
    .from("cafe_menu")
    .select("id, name, price, available, category")
    .order("category")
    .order("name");

  if (error) {
    return (
      <div className="p-8 text-red-700 bg-red-100">
        {dict.cafe.error}: {error.message}
      </div>
    );
  }

  const available = (data ?? []).filter((i) => i.available);
  if (available.length === 0) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        {params.lang === "es"
          ? "No hay elementos de menú disponibles."
          : "No menu items available yet."}
      </p>
    );
  }

  const itemsByCategory: Record<string, typeof available> = {};
  for (const item of available) {
    const cat = item.category ?? (params.lang === "es" ? "Otros" : "Others");
    (itemsByCategory[cat] ||= []).push(item);
  }

  return <CafeClientPage dict={dict} itemsByCategory={itemsByCategory} />;
}