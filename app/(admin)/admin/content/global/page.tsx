"use client";

import { Globe } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import globalContent from "@/lib/content/data/global";
import { useAdminLocale } from "@/lib/admin/i18n";
import { VisualPageEditor, useEditor, EditableBilingual, EditableImage, EditableJSON } from "@/components/admin/visual-editor";

function GlobalVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();

  return (
    <div className="space-y-8">
      {/* Site identity */}
      <section className="rounded-3xl bg-white/60 ring-1 ring-black/5 p-8 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Identidad del sitio", en: "Site Identity" })}</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--olivea-olive)]">{t({ es: "Nombre del sitio", en: "Site Name" })}</label>
            <input
              type="text"
              value={(get("siteName") as string) ?? ""}
              onChange={(e) => set("siteName", e.target.value)}
              className="w-full text-2xl font-serif text-stone-800 bg-transparent border-0 border-b-2 border-transparent hover:border-stone-200 focus:border-[var(--olivea-olive)] outline-none px-0 py-1 transition-colors"
              placeholder={t({ es: "Nombre del sitio…", en: "Site name..." })}
            />
          </div>
          <EditableBilingual label={{ es: "Eslogan", en: "Tagline" }} as="p" value={(get("tagline") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("tagline", v)} className="text-base text-stone-600 italic" />
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--olivea-olive)]">{t({ es: "Idioma predeterminado", en: "Default Locale" })}</label>
            <input
              type="text"
              value={(get("defaultLocale") as string) ?? ""}
              onChange={(e) => set("defaultLocale", e.target.value)}
              className="w-full text-sm text-stone-700 bg-transparent border-0 border-b-2 border-transparent hover:border-stone-200 focus:border-[var(--olivea-olive)] outline-none px-0 py-1 transition-colors"
              placeholder="es"
            />
          </div>
        </div>
      </section>

      {/* OG Image */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Imagen OG predeterminada", en: "Default OG Image" })}</h3>
        <EditableImage
          src={(get("defaultOgImage") as string) ?? ""}
          onChange={(src) => set("defaultOgImage", src)}
          className="rounded-xl max-w-md"
          aspect="wide"
          label={{ es: "Imagen OG", en: "OG Image" }}
        />
      </section>

      {/* Twitter handle */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Redes sociales", en: "Social" })}</h3>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--olivea-olive)]">{t({ es: "Usuario de Twitter", en: "Twitter Handle" })}</label>
          <input
            type="text"
            value={(get("twitterHandle") as string) ?? ""}
            onChange={(e) => set("twitterHandle", e.target.value)}
            className="w-full text-sm text-stone-700 bg-transparent border-0 border-b-2 border-transparent hover:border-stone-200 focus:border-[var(--olivea-olive)] outline-none px-0 py-1 transition-colors"
            placeholder="@olivea"
          />
        </div>
      </section>

      {/* Structured data */}
      <EditableJSON label={t({ es: "Información de contacto", en: "Contact Info" })} value={get("contactInfo")} onChange={(v) => set("contactInfo", v)} rows={8} collapsed />
      <EditableJSON label={t({ es: "Horarios", en: "Hours" })} value={get("hours")} onChange={(v) => set("hours", v)} rows={8} collapsed />
      <EditableJSON label={t({ es: "Redes sociales", en: "Socials" })} value={get("socials")} onChange={(v) => set("socials", v)} rows={6} collapsed />
    </div>
  );
}

export default function GlobalSettingsAdmin() {
  return (
    <SectionGuard sectionKey="settings.global">
      <VisualPageEditor title="Global Settings" table="global_settings" icon={<Globe className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={globalContent as unknown as Record<string, unknown>} livePath="/">
        <GlobalVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
