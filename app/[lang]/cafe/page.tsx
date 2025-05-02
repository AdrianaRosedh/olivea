import type { Metadata } from "next";
import { getDictionary, type Lang } from "../dictionaries";
import { supabase } from "@/lib/supabase";
import CafeClientPage, {
  SectionDict,
  MenuItem,
} from "./CafeClientPage";

export async function generateMetadata({
  params,
}: {
  // params is now a Promise in Next.js 15.3+
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  // 1️⃣ Await the params promise
  const { lang: rawLang } = await params;

  // 2️⃣ Narrow to our union
  const lang: Lang = rawLang === "es" ? "es" : "en";

  // 3️⃣ Load translations
  const dicts = await getDictionary(lang);

  return {
    title:       dicts.cafe.title,
    description: dicts.cafe.description,
  };
}

export default async function CafePage({
  params,
}: {
  // params here is also a Promise
  params: Promise<{ lang: string }>;
}) {
  // 4️⃣ Await & coerce again
  const { lang: rawLang } = await params;
  const lang: Lang = rawLang === "es" ? "es" : "en";

  // 5️⃣ Load translations
  const dicts = await getDictionary(lang);
  const dict: SectionDict = dicts.cafe;

  // 6️⃣ Fetch your Supabase data
  const { data, error } = await supabase
    .from("cafe_menu")
    .select("id, name, price, available, category")
    .order("category")
    .order("name");

  if (error) {
    return (
      <div className="p-8 text-red-700 bg-red-100">
        {dict.error ?? "Error"}: {error.message}
      </div>
    );
  }

  // 7️⃣ Filter & group
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
    const cat = item.category || (lang === "es" ? "Otros" : "Others");
    (itemsByCategory[cat] ||= []).push(item);
  }

  // 8️⃣ Hand off to your client component
  return (
    <CafeClientPage
      lang={lang}
      dict={dict}
      itemsByCategory={itemsByCategory}
    />
  );
}