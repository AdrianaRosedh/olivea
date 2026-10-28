"use client";

// How a house — and Olivea as a whole — appears to Google and AI assistants:
// the schema.org listing in components/seo/StructuredDataServer.tsx. A field
// left empty is left out of what Google is given, never invented.
//
// GoogleListingCard sits on each house's admin page (listing column);
// OrganizationListingCard sits in Brand & Identity (global_settings.organization).

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import EditableListShell from "./EditableListShell";
import { useAdminLocale, type MaybeB } from "@/lib/admin/i18n";
import type { BusinessListing, OrganizationListing } from "@/lib/content/types";

const INPUT =
  "w-full rounded-xl bg-white/80 ring-1 ring-black/10 px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]/40";

const PRICE_LEVELS = ["$", "$$", "$$$", "$$$$"] as const;

function Field({ label, hint, children }: { label: MaybeB; hint?: MaybeB; children: ReactNode }) {
  const { t } = useAdminLocale();
  const text = (v?: MaybeB) => (v === undefined ? "" : typeof v === "string" ? v : t(v));
  return (
    <label className="block space-y-1">
      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{text(label)}</span>
      {children}
      {hint && <span className="block text-[11px] text-stone-400">{text(hint)}</span>}
    </label>
  );
}

function StringList({ label, value, onChange, addLabel }: {
  label: MaybeB;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
  addLabel: MaybeB;
}) {
  return (
    <EditableListShell<string>
      label={label}
      items={value ?? []}
      onChange={onChange}
      makeItem={() => ""}
      addLabel={addLabel}
      renderItem={(item, update) => (
        <input className={INPUT} value={item} onChange={(e) => update(e.target.value)} />
      )}
    />
  );
}

function Card({ title, note, children }: { title: MaybeB; note: MaybeB; children: ReactNode }) {
  const { t } = useAdminLocale();
  const text = (v: MaybeB) => (typeof v === "string" ? v : t(v));
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[var(--olivea-olive)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{text(title)}</span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">{text(note)}</p>
      </div>
      {children}
    </section>
  );
}

export function GoogleListingCard({
  value,
  onChange,
  cuisine = false,
}: {
  value: BusinessListing | undefined;
  onChange: (v: BusinessListing) => void;
  /** Restaurants and the café list cuisines; the farm stay does not. */
  cuisine?: boolean;
}) {
  const v = value ?? {};
  const set = <K extends keyof BusinessListing>(k: K, x: BusinessListing[K]) => onChange({ ...v, [k]: x });

  return (
    <Card
      title={{ es: "Ficha en Google", en: "Google listing" }}
      note={{
        es: "Lo que Google y los asistentes de IA leen de esta casa. En inglés (Google lo lee en un idioma). Un campo vacío se omite.",
        en: "What Google and AI assistants read about this house. In English (Google reads it in one language). An empty field is left out.",
      }}
    >
      <Field label={{ es: "Descripción", en: "Description" }}>
        <textarea className={INPUT} rows={4} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={{ es: "Teléfono", en: "Phone" }} hint="+52 646 383 6402">
          <input className={INPUT} value={v.telephone ?? ""} onChange={(e) => set("telephone", e.target.value)} />
        </Field>
        <Field label={{ es: "Nivel de precio", en: "Price level" }}>
          <select className={INPUT} value={v.priceRange ?? ""} onChange={(e) => set("priceRange", e.target.value)}>
            <option value="">—</option>
            {PRICE_LEVELS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label={{ es: "Enlace de Google Maps", en: "Google Maps link" }}>
          <input className={INPUT} value={v.mapsUrl ?? ""} onChange={(e) => set("mapsUrl", e.target.value)} />
        </Field>
        <Field label={{ es: "Otro nombre", en: "Also known as" }}>
          <input className={INPUT} value={v.alternateName ?? ""} onChange={(e) => set("alternateName", e.target.value)} />
        </Field>
      </div>
      <Field
        label={{ es: "Palabras clave", en: "Keywords" }}
        hint={{ es: "Separadas por comas", en: "Comma-separated" }}
      >
        <textarea className={INPUT} rows={2} value={v.keywords ?? ""} onChange={(e) => set("keywords", e.target.value)} />
      </Field>
      {cuisine && (
        <StringList
          label={{ es: "Cocina", en: "Cuisine" }}
          value={v.servesCuisine}
          onChange={(x) => set("servesCuisine", x)}
          addLabel={{ es: "Agregar cocina", en: "Add cuisine" }}
        />
      )}
      <StringList
        label={{ es: "Amenidades", en: "Amenities" }}
        value={v.amenities}
        onChange={(x) => set("amenities", x)}
        addLabel={{ es: "Agregar amenidad", en: "Add amenity" }}
      />
    </Card>
  );
}

export function OrganizationListingCard({
  value,
  onChange,
}: {
  value: OrganizationListing | undefined;
  onChange: (v: OrganizationListing) => void;
}) {
  const v = value ?? {};
  const set = <K extends keyof OrganizationListing>(k: K, x: OrganizationListing[K]) => onChange({ ...v, [k]: x });

  return (
    <Card
      title={{ es: "Olivea en Google", en: "Olivea on Google" }}
      note={{
        es: "Olivea como un todo, para el panel de Google y los asistentes de IA. En inglés. Un campo vacío se omite.",
        en: "Olivea as a whole, for Google's panel and AI assistants. In English. An empty field is left out.",
      }}
    >
      <Field label={{ es: "Descripción", en: "Description" }}>
        <textarea className={INPUT} rows={3} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={{ es: "Otro nombre", en: "Also known as" }}>
          <input className={INPUT} value={v.alternateName ?? ""} onChange={(e) => set("alternateName", e.target.value)} />
        </Field>
        <Field label={{ es: "Teléfono de atención", en: "Customer service phone" }} hint="+52 646 383 6402">
          <input className={INPUT} value={v.telephone ?? ""} onChange={(e) => set("telephone", e.target.value)} />
        </Field>
      </div>
      <Field label={{ es: "Zona que atiende", en: "Area served" }}>
        <input className={INPUT} value={v.areaServed ?? ""} onChange={(e) => set("areaServed", e.target.value)} />
      </Field>
      <StringList
        label={{ es: "Especialidades", en: "Known for" }}
        value={v.knowsAbout}
        onChange={(x) => set("knowsAbout", x)}
        addLabel={{ es: "Agregar especialidad", en: "Add specialty" }}
      />
      <StringList
        label={{ es: "Perfiles oficiales (Instagram, Facebook…)", en: "Official profiles (Instagram, Facebook…)" }}
        value={v.sameAs}
        onChange={(x) => set("sameAs", x)}
        addLabel={{ es: "Agregar perfil", en: "Add profile" }}
      />
    </Card>
  );
}
