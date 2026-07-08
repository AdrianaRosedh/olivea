"use client";

import { Mail, MapPin, Phone, AtSign } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import contactContent from "@/lib/content/data/contact";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
} from "@/components/admin/visual-editor";
import { useAdminLocale } from "@/lib/admin/i18n";

function ContactVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();

  const meta = get("meta") as { title?: { es: string; en: string }; description?: { es: string; en: string } } | undefined;
  const kicker = (get("kicker") ?? { es: "", en: "" }) as { es: string; en: string };
  const subtitle = (get("subtitle") ?? { es: "", en: "" }) as { es: string; en: string };
  const actions = (get("actions") ?? {}) as Record<string, { es: string; en: string }>;
  const labels = (get("labels") ?? {}) as Record<string, { es: string; en: string }>;
  const sections = (get("sections") ?? {}) as Record<string, { es: string; en: string }>;
  const footerNote = (get("footerNote") ?? { es: "", en: "" }) as { es: string; en: string };
  const map = (get("map") ?? {}) as Record<string, { es: string; en: string }>;

  return (
    <div className="space-y-8">
      <MetaSection>
        <EditableBilingual label={{ es: "Título SEO", en: "Meta Title" }} as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label={{ es: "Descripción SEO", en: "Meta Description" }} as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      {/* ── Page header (mimics the contact hero) ────────────── */}
      <section className="rounded-3xl bg-white/60 backdrop-blur-sm ring-1 ring-black/5 shadow-sm p-8 md:p-12 text-center space-y-4">
        <EditableBilingual
          label={{ es: "Antetítulo", en: "Kicker" }} as="small"
          value={kicker}
          onChange={(v) => set("kicker", v)}
          className="text-xs uppercase tracking-[0.34em] text-[var(--olivea-olive)] font-semibold"
          placeholder={t({ es: "Antetítulo de la sección…", en: "Section kicker..." })}
        />
        <EditableBilingual
          label={{ es: "Subtítulo", en: "Subtitle" }} as="h1"
          value={subtitle}
          onChange={(v) => set("subtitle", v)}
          className="text-xl md:text-2xl font-serif text-stone-800"
          placeholder={t({ es: "Subtítulo de la página…", en: "Page subtitle..." })}
        />
      </section>

      {/* ── Action buttons ───────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Etiquetas de acción", en: "Action Labels" })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-full bg-white/60 ring-1 ring-black/5 px-5 py-3">
            <MapPin className="w-4 h-4 text-[var(--olivea-olive)] shrink-0" />
            <EditableBilingual
              label={{ es: "Botón de Mapas", en: "Maps CTA" }} as="span"
              value={actions.maps ?? { es: "", en: "" }}
              onChange={(v) => set("actions.maps", v)}
              className="text-sm font-medium text-stone-700"
            />
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white/60 ring-1 ring-black/5 px-5 py-3">
            <AtSign className="w-4 h-4 text-[var(--olivea-olive)] shrink-0" />
            <EditableBilingual
              label={{ es: "Botón de Correo", en: "Email CTA" }} as="span"
              value={actions.email ?? { es: "", en: "" }}
              onChange={(v) => set("actions.email", v)}
              className="text-sm font-medium text-stone-700"
            />
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white/60 ring-1 ring-black/5 px-5 py-3">
            <Phone className="w-4 h-4 text-[var(--olivea-olive)] shrink-0" />
            <EditableBilingual
              label={{ es: "Botón de Llamada", en: "Call CTA" }} as="span"
              value={actions.call ?? { es: "", en: "" }}
              onChange={(v) => set("actions.call", v)}
              className="text-sm font-medium text-stone-700"
            />
          </div>
        </div>
      </section>

      {/* ── Field labels ─────────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Etiquetas de campo", en: "Field Labels" })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableBilingual label={{ es: "Etiqueta de dirección", en: "Address Label" }} as="span" value={labels.address ?? { es: "", en: "" }} onChange={(v) => set("labels.address", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Etiqueta de correo", en: "Email Label" }} as="span" value={labels.email ?? { es: "", en: "" }} onChange={(v) => set("labels.email", v)} className="text-sm text-stone-600" />
        </div>
      </section>

      {/* ── Section titles ───────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Títulos de sección", en: "Section Titles" })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white/60 ring-1 ring-black/5 p-5 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Farm to Table</span>
            <EditableBilingual label={{ es: "Título Farm to Table", en: "FTT Title" }} as="h3" value={sections.farmToTableTitle ?? { es: "", en: "" }} onChange={(v) => set("sections.farmToTableTitle", v)} className="text-lg font-serif text-stone-800" />
          </div>
          <div className="rounded-xl bg-white/60 ring-1 ring-black/5 p-5 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Café</span>
            <EditableBilingual label={{ es: "Título Café", en: "Café Title" }} as="h3" value={sections.cafeTitle ?? { es: "", en: "" }} onChange={(v) => set("sections.cafeTitle", v)} className="text-lg font-serif text-stone-800" />
          </div>
          <div className="rounded-xl bg-white/60 ring-1 ring-black/5 p-5 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Casa</span>
            <EditableBilingual label={{ es: "Título Casa", en: "Casa Title" }} as="h3" value={sections.casaTitle ?? { es: "", en: "" }} onChange={(v) => set("sections.casaTitle", v)} className="text-lg font-serif text-stone-800" />
          </div>
        </div>
      </section>

      {/* ── Footer note ──────────────────────────────────────── */}
      <section className="rounded-2xl bg-[var(--olivea-olive)]/5 ring-1 ring-[var(--olivea-olive)]/10 p-6">
        <EditableBilingual
          label={{ es: "Nota al pie", en: "Footer Note" }} as="p"
          value={footerNote}
          onChange={(v) => set("footerNote", v)}
          className="text-sm text-stone-600 italic leading-relaxed"
          multiline
          placeholder={t({ es: "Texto de la nota al pie…", en: "Footer note text..." })}
        />
      </section>

      {/* ── Map labels ───────────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Sección del mapa", en: "Map Section" })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableBilingual label={{ es: "Título del iframe", en: "Iframe Title" }} as="span" value={map.iframeTitle ?? { es: "", en: "" }} onChange={(v) => set("map.iframeTitle", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Etiqueta de la insignia", en: "Badge Label" }} as="span" value={map.badgeLabel ?? { es: "", en: "" }} onChange={(v) => set("map.badgeLabel", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Valor de la insignia", en: "Badge Value" }} as="span" value={map.badgeValue ?? { es: "", en: "" }} onChange={(v) => set("map.badgeValue", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Botón de Google Maps", en: "Google Maps CTA" }} as="span" value={map.googleMapsCta ?? { es: "", en: "" }} onChange={(v) => set("map.googleMapsCta", v)} className="text-sm text-stone-600" />
        </div>
      </section>
    </div>
  );
}

export default function ContactAdmin() {
  return (
    <SectionGuard sectionKey="pages.contact">
      <VisualPageEditor title="Contact" table="contact_content" icon={<Mail className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={contactContent as unknown as Record<string, unknown>} livePath="/contact">
        <ContactVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
