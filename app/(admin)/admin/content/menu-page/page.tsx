"use client";

// The /menu page's own text: its title and description in Google and link
// previews, and the questions it answers (à la carte or holistic menu,
// vegetarian, pairings). Stored in menu_content. The menus themselves are
// managed in /admin/menu.

import { UtensilsCrossed } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import menuContent from "@/lib/content/data/menu";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
  EditableFAQ,
  storedToEditorFaq,
  editorToStoredFaq,
} from "@/components/admin/visual-editor";

function MenuPageVisual() {
  const { get, set } = useEditor();
  const meta = get("meta") as
    | { title?: { es: string; en: string }; description?: { es: string; en: string } }
    | undefined;

  return (
    <div className="space-y-8">
      <MetaSection>
        <EditableBilingual
          label={{ es: "Título SEO", en: "Meta Title" }}
          as="small"
          value={meta?.title ?? { es: "", en: "" }}
          onChange={(v) => set("meta.title", v)}
          className="text-sm text-stone-600"
        />
        <EditableBilingual
          label={{ es: "Descripción SEO", en: "Meta Description" }}
          as="small"
          value={meta?.description ?? { es: "", en: "" }}
          onChange={(v) => set("meta.description", v)}
          className="text-sm text-stone-600"
          multiline
        />
      </MetaSection>

      <EditableFAQ
        label={{ es: "Preguntas frecuentes", en: "FAQ" }}
        value={storedToEditorFaq(get("faq"))}
        onChange={(entries) => set("faq", editorToStoredFaq(entries))}
        collapsed={false}
      />
    </div>
  );
}

export default function MenuPageAdmin() {
  return (
    <SectionGuard sectionKey="pages.menu">
      <VisualPageEditor
        title="Menu"
        table="menu_content"
        icon={<UtensilsCrossed className="w-5 h-5 text-[var(--olivea-olive)]" />}
        fallbackData={menuContent as unknown as Record<string, unknown>}
        livePath="/menu"
      >
        <MenuPageVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
