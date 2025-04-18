import { supabase } from "@/lib/supabase";

export default async function CafePage() {
  const { data: menuItems, error } = await supabase
    .from("cafe_menu")
    .select("*");
  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">Olivea Café</h1>
      <p className="mt-2 text-muted-foreground mb-6">
        Our casual, garden-facing café. Menu and hours coming soon.
      </p>

      {error && <p className="text-red-500">Error loading menu: {error.message}</p>}

      <ul className="space-y-4">
        {menuItems?.map((item) => (
          <li key={item.id} className="flex justify-between border-b pb-2">
            <span>{item.name}</span>
            <span className="text-muted-foreground">${item.price}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}