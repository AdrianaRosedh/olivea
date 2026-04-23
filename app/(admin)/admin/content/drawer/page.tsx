"use client";

import { Menu } from "lucide-react";
import drawerContent from "@/lib/content/data/drawer";
import {
  VisualPageEditor,
  useEditor,
  EditableBilingual,
  EditableSections,
} from "@/components/admin/visual-editor";

function DrawerVisual() {
  const { get, set } = useEditor();

  const mainLinks = (get("mainLinks") ?? []) as Array<{
    title?: { es: string; en: string };
    description?: { es: string; en: string };
  }>;

  const moreLinks = (get("moreLinks") ?? []) as Array<{
    title?: { es: string; en: string };
    description?: { es: string; en: string };
  }>;

  return (
    <div className="space-y-6">
      {/* Visual drawer preview */}
      <section className="rounded-2xl bg-stone-900 text-white p-6 md:p-8 space-y-5 max-w-sm mx-auto">
        <div className="text-xs uppercase tracking-wider text-white/40 font-semibold">
          Drawer Preview
        </div>
        <div className="h-px bg-white/10" />
        <div className="space-y-2">
          <EditableBilingual
            label="Copyright" as="small"
            value={(get("copyright") ?? { es: "", en: "" }) as { es: string; en: string }}
            onChange={(v) => set("copyright", v)}
            className="text-xs text-white/50"
          />
        </div>
        <div className="flex gap-4">
          <EditableBilingual
            label="See More" as="span"
            value={(get("seeMore") ?? { es: "", en: "" }) as { es: string; en: string }}
            onChange={(v) => set("seeMore", v)}
            className="text-xs text-white/60 underline underline-offset-2"
          />
          <EditableBilingual
            label="Hide" as="span"
            value={(get("hide") ?? { es: "", en: "" }) as { es: string; en: string }}
            onChange={(v) => set("hide", v)}
            className="text-xs text-white/60 underline underline-offset-2"
          />
        </div>
      </section>

      {/* Link sections — proper visual editors */}
      <EditableSections
        label="Main Links"
        value={mainLinks}
        onChange={(v) => set("mainLinks", v)}
        fields={["title", "description"]}
        collapsed={false}
      />

      <EditableSections
        label="More Links"
        value={moreLinks}
        onChange={(v) => set("moreLinks", v)}
        fields={["title", "description"]}
        collapsed
      />
    </div>
  );
}

export default function DrawerAdmin() {
  return (
    <VisualPageEditor
      title="Drawer Navigation"
      table="drawer_content"
      icon={<Menu className="w-5 h-5 text-[var(--olivea-olive)]" />}
      fallbackData={drawerContent as unknown as Record<string, unknown>}
    >
      <DrawerVisual />
    </VisualPageEditor>
  );
}
