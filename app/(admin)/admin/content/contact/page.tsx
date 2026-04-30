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

function ContactVisual() {
  const { get, set } = useEditor();

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
        <EditableBilingual label="Meta Title" as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label="Meta Description" as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      {/* ── Page header (mimics the contact hero) ────────────── */}
      <section className="rounded-3xl bg-white/60 backdrop-blur-sm ring-1 ring-black/5 shadow-sm p-8 md:p-12 text-center space-y-4">
        <EditableBilingual
          label="Kicker" as="small"
          value={kicker}
          onChange={(v) => set("kicker", v)}
          className="text-xs uppercase tracking-[0.34em] text-[var(--olivea-olive)] font-semibold"
          placeholder="Section kicker..."
        />
        <EditableBilingual
          label="Subtitle" as="h1"
          value={subtitle}
          onChange={(v) => set("subtitle", v)}
          className="text-xl md:text-2xl font-serif text-stone-800"
          placeholder="Page subtitle..."
        />
      </section>

      {/* ── Action buttons ───────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Action Labels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-full bg-white/60 ring-1 ring-black/5 px-5 py-3">
            <MapPin className="w-4 h-4 text-[var(--olivea-olive)] shrink-0" />
            <EditableBilingual
              label="Maps CTA" as="span"
              value={actions.maps ?? { es: "", en: "" }}
              onChange={(v) => set("actions.maps", v)}
              className="text-sm font-medium text-stone-700"
            />
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white/60 ring-1 ring-black/5 px-5 py-3">
            <AtSign className="w-4 h-4 text-[var(--olivea-olive)] shrink-0" />
            <EditableBilingual
              label="Email CTA" as="span"
              value={actions.email ?? { es: "", en: "" }}
              onChange={(v) => set("actions.email", v)}
              className="text-sm font-medium text-stone-700"
            />
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white/60 ring-1 ring-black/5 px-5 py-3">
            <Phone className="w-4 h-4 text-[var(--olivea-olive)] shrink-0" />
            <EditableBilingual
              label="Call CTA" as="span"
              value={actions.call ?? { es: "", en: "" }}
              onChange={(v) => set("actions.call", v)}
              className="text-sm font-medium text-stone-700"
            />
          </div>
        </div>
      </section>

      {/* ── Field labels ─────────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Field Labels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableBilingual label="Address Label" as="span" value={labels.address ?? { es: "", en: "" }} onChange={(v) => set("labels.address", v)} className="text-sm text-stone-600" />
          <EditableBilingual label="Email Label" as="span" value={labels.email ?? { es: "", en: "" }} onChange={(v) => set("labels.email", v)} className="text-sm text-stone-600" />
        </div>
      </section>

      {/* ── Section titles ───────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Section Titles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white/60 ring-1 ring-black/5 p-5 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Farm to Table</span>
            <EditableBilingual label="FTT Title" as="h3" value={sections.farmToTableTitle ?? { es: "", en: "" }} onChange={(v) => set("sections.farmToTableTitle", v)} className="text-lg font-serif text-stone-800" />
          </div>
          <div className="rounded-xl bg-white/60 ring-1 ring-black/5 p-5 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Casa & Café</span>
            <EditableBilingual label="Casa/Café Title" as="h3" value={sections.casaCafeTitle ?? { es: "", en: "" }} onChange={(v) => set("sections.casaCafeTitle", v)} className="text-lg font-serif text-stone-800" />
          </div>
        </div>
      </section>

      {/* ── Footer note ──────────────────────────────────────── */}
      <section className="rounded-2xl bg-[var(--olivea-olive)]/5 ring-1 ring-[var(--olivea-olive)]/10 p-6">
        <EditableBilingual
          label="Footer Note" as="p"
          value={footerNote}
          onChange={(v) => set("footerNote", v)}
          className="text-sm text-stone-600 italic leading-relaxed"
          multiline
          placeholder="Footer note text..."
        />
      </section>

      {/* ── Map labels ───────────────────────────────────────── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Map Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableBilingual label="Iframe Title" as="span" value={map.iframeTitle ?? { es: "", en: "" }} onChange={(v) => set("map.iframeTitle", v)} className="text-sm text-stone-600" />
          <EditableBilingual label="Badge Label" as="span" value={map.badgeLabel ?? { es: "", en: "" }} onChange={(v) => set("map.badgeLabel", v)} className="text-sm text-stone-600" />
          <EditableBilingual label="Badge Value" as="span" value={map.badgeValue ?? { es: "", en: "" }} onChange={(v) => set("map.badgeValue", v)} className="text-sm text-stone-600" />
          <EditableBilingual label="Google Maps CTA" as="span" value={map.googleMapsCta ?? { es: "", en: "" }} onChange={(v) => set("map.googleMapsCta", v)} className="text-sm text-stone-600" />
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
