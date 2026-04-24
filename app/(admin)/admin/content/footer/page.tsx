"use client";

import { PanelBottom } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import footerContent from "@/lib/content/data/footer";
import { VisualPageEditor, useEditor, EditableBilingual } from "@/components/admin/visual-editor";

function FooterVisual() {
  const { get, set } = useEditor();

  return (
    <div className="space-y-8">
      {/* Visual footer preview */}
      <section className="rounded-3xl bg-stone-900 text-white p-8 md:p-12 space-y-4">
        <div className="text-xs uppercase tracking-wider text-white/40 font-semibold">Footer Preview</div>
        <div className="h-px bg-white/10" />
        <div className="flex flex-wrap gap-6 pt-2">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">Careers Link</span>
            <EditableBilingual label="Careers" as="span" value={(get("careers") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("careers", v)} className="text-sm text-white/70 block" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">Legal Link</span>
            <EditableBilingual label="Legal" as="span" value={(get("legal") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("legal", v)} className="text-sm text-white/70 block" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FooterAdmin() {
  return (
    <SectionGuard sectionKey="settings.footer">
      <VisualPageEditor title="Footer" table="footer_content" icon={<PanelBottom className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={footerContent as unknown as Record<string, unknown>}>
        <FooterVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
