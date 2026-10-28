"use client";

// How a house — and Olivea as a whole — appears to Google and AI assistants:
// the schema.org listing in components/seo/StructuredDataServer.tsx. A field
// left empty is left out of what Google is given, never invented.
//
// GoogleListingCard sits on each house's admin page (listing column);
// OrganizationListingCard sits in Brand & Identity (global_settings.organization).

import { useEffect, useState, type ReactNode } from "react";
import { getPageContent } from "@/lib/supabase/actions";
import { Search } from "lucide-react";
import { useAdminLocale, type MaybeB } from "@/lib/admin/i18n";
import { INPUT, Field, StringList } from "./PlainFields";
import type { BusinessListing, OrganizationListing } from "@/lib/content/types";

const PRICE_LEVELS = ["$", "$$", "$$$", "$$$$"] as const;

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
      <PeoplePicker
        founderId={v.founderId}
        leaderIds={v.leaderIds}
        onChange={(founderId, leaderIds) => onChange({ ...v, founderId, leaderIds })}
      />
    </Card>
  );
}

/** Google names Olivea's founder and leaders from the Team roster; their
 *  names, roles and pages come from there. */
function PeoplePicker({
  founderId,
  leaderIds,
  onChange,
}: {
  founderId?: string;
  leaderIds?: string[];
  onChange: (founderId: string | undefined, leaderIds: string[]) => void;
}) {
  const { t } = useAdminLocale();
  const [roster, setRoster] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => {
    getPageContent("team_content")
      .then((row) => {
        const members = ((row as { members?: Array<{ id: string; name: string }> } | null)?.members ?? []).filter((m) => m.id && m.name);
        setRoster(members);
      })
      .catch(() => setRoster([]));
  }, []);
  const leaders = leaderIds ?? [];
  const toggle = (id: string) =>
    onChange(founderId, leaders.includes(id) ? leaders.filter((x) => x !== id) : [...leaders, id]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={{ es: "Fundadora / fundador", en: "Founder" }}>
        <select className={INPUT} value={founderId ?? ""} onChange={(e) => onChange(e.target.value || undefined, leaders)}>
          <option value="">—</option>
          {roster.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </Field>
      <fieldset className="space-y-1">
        <legend className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Líderes", en: "Leaders" })}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          {roster.map((m) => (
            <label key={m.id} className="inline-flex items-center gap-1.5 text-sm text-stone-700">
              <input type="checkbox" checked={leaders.includes(m.id)} onChange={() => toggle(m.id)} />
              {m.name}
            </label>
          ))}
        </div>
        <span className="block text-[11px] text-stone-400">
          {t({ es: "Sus nombres y puestos salen del Equipo", en: "Names and roles come from the Team roster" })}
        </span>
      </fieldset>
    </div>
  );
}
