"use client";

// Dated dinners and events (Mesa Invitada…), stored in public.events and shown
// by their series page (/mesa-invitada). The page shows the next upcoming
// event; once its date passes (Baja California time) it shows it as past — no
// prices, no booking, no Event markup — until a newer one is published.
// A new event starts as a copy of the selected one, so its labels carry over.

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, Save, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import BilingualField from "@/components/admin/BilingualField";
import ImageUpload from "@/components/admin/ImageUpload";
import { getEventsAdmin, saveEvent, toggleEvent } from "@/lib/supabase/actions";
import { useAdminLocale } from "@/lib/admin/i18n";
import type { Bilingual } from "@/lib/content/types";

type EventRow = {
  id: string;
  series: string;
  enabled: boolean;
  event_date: string;
  poster: string | null;
  share_image: string | null;
  booking_url: string | null;
  dinner_price: number | null;
  stay_price: number | null;
  copy: Record<string, Bilingual>;
};

const SERIES = [{ id: "mesa-invitada", label: "Mesa Invitada", path: "/mesa-invitada" }];

/** Every line of the event page, grouped as it reads on the page. */
const COPY_GROUPS: Array<{ title: Bilingual; fields: Array<[string, string, boolean?]> }> = [
  {
    title: { es: "Encabezado", en: "Header" },
    fields: [
      ["eventName", "Event name (Google)"],
      ["kicker", "Kicker"],
      ["occasion", "Occasion"],
      ["title", "Title"],
      ["chefLabel", "Chef label"],
      ["chef", "Chef"],
      ["chefOf", "Chef's restaurant / distinction"],
      ["when", "When"],
      ["where", "Where"],
      ["intro", "Intro", true],
    ],
  },
  {
    title: { es: "Cena", en: "Dinner" },
    fields: [
      ["dinnerKicker", "Kicker"],
      ["dinnerTitle", "Title"],
      ["dinnerBody", "Text", true],
      ["perPerson", "Price note"],
      ["dinnerCta", "Button"],
      ["dinnerVia", "Under the button"],
    ],
  },
  {
    title: { es: "Estancia", en: "Stay" },
    fields: [
      ["stayKicker", "Kicker"],
      ["stayTitle", "Title"],
      ["stayBody", "Text", true],
      ["plusTax", "Price note"],
      ["stayCta", "Button"],
      ["stayVia", "Under the button"],
      ["stayMessage", "WhatsApp message", true],
    ],
  },
  {
    title: { es: "Cuando ya pasó", en: "After the date" },
    fields: [["pastNote", "Past note (replaces prices and booking)", true]],
  },
  {
    title: { es: "Compartir y Google", en: "Sharing & Google" },
    fields: [
      ["metaTitle", "Google title"],
      ["metaDescription", "Google description", true],
      ["posterAlt", "Poster description (alt)", true],
      ["limited", "Limited note"],
      ["share", "Share button"],
      ["copied", "Link copied"],
      ["shareText", "Share text", true],
    ],
  },
];

const EMPTY_BI: Bilingual = { es: "", en: "" };
const INPUT =
  "w-full text-sm px-3 py-2 rounded-md border border-stone-300 bg-white/70 text-stone-800 outline-none focus:ring-1 focus:ring-olive-500";
const LABEL = "text-xs font-bold uppercase tracking-wider text-stone-500";

function todayInBaja(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Tijuana", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function EventsEditor() {
  const { t } = useAdminLocale();
  const [rows, setRows] = useState<EventRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const load = useCallback(async () => {
    const data = ((await getEventsAdmin()) ?? []) as unknown as EventRow[];
    setRows(data);
    return data;
  }, []);

  useEffect(() => {
    load().then((data) => {
      if (data[0]) {
        setSelectedId(data[0].id);
        setDraft(structuredClone(data[0]));
      }
    });
  }, [load]);

  const today = todayInBaja();
  const statusOf = (r: EventRow) =>
    r.enabled === false
      ? t({ es: "Oculto", en: "Hidden" })
      : r.event_date >= today
        ? t({ es: "Próximo", en: "Upcoming" })
        : t({ es: "Pasado", en: "Past" });

  const select = (r: EventRow) => {
    setSelectedId(r.id);
    setDraft(structuredClone(r));
    setIsNew(false);
    setStatus("idle");
  };

  const startNew = () => {
    const base = draft ?? rows[0];
    setDraft({
      ...(base ? structuredClone(base) : { series: "mesa-invitada", copy: {} as Record<string, Bilingual> }),
      id: "",
      enabled: false,
      event_date: "",
      poster: null,
      share_image: null,
      booking_url: null,
      dinner_price: null,
      stay_price: null,
    } as EventRow);
    setSelectedId(null);
    setIsNew(true);
    setStatus("idle");
  };

  const patch = (p: Partial<EventRow>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const patchCopy = (key: string, v: Bilingual) => setDraft((d) => (d ? { ...d, copy: { ...d.copy, [key]: v } } : d));

  const valid = !!draft && /^[a-z0-9][a-z0-9-]{1,80}$/.test(draft.id) && /^\d{4}-\d{2}-\d{2}$/.test(draft.event_date);

  const handleSave = async () => {
    if (!draft || !valid) return;
    setSaving(true);
    try {
      await saveEvent(draft as unknown as Record<string, unknown>);
      await load();
      setSelectedId(draft.id);
      setIsNew(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
    setSaving(false);
  };

  const handleToggle = async (r: EventRow) => {
    const next = r.enabled === false;
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: next } : x)));
    if (draft?.id === r.id) patch({ enabled: next });
    try {
      await toggleEvent(r.id, next);
    } catch {
      load();
    }
  };

  const seriesPath = useMemo(() => SERIES.find((s) => s.id === draft?.series)?.path ?? "/mesa-invitada", [draft?.series]);

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-5">
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[var(--olivea-olive)]" />
          <span className="font-semibold text-stone-800">{t({ es: "Eventos", en: "Events" })}</span>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white ring-1 ring-black/10 hover:bg-stone-50">
          <Plus className="w-4 h-4" /> {t({ es: "Nuevo evento", en: "New event" })}
        </button>
      </div>

      <p className="text-xs text-stone-500 leading-relaxed px-1">
        {t({
          es: "La página muestra el próximo evento. Cuando pasa su fecha y no hay uno nuevo, lo muestra como pasado: sin precios, sin reservas y sin avisar a Google. Un evento nuevo empieza como copia del seleccionado y se guarda oculto hasta que lo actives.",
          en: "The page shows the next event. Once its date passes and there is no newer one, it shows it as past: no prices, no booking, nothing announced to Google. A new event starts as a copy of the selected one and is saved hidden until you switch it on.",
        })}
      </p>

      <div className="grid gap-5 md:grid-cols-[16rem_1fr]">
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => select(r)}
                className={`w-full text-left rounded-xl px-4 py-3 ring-1 transition-colors ${selectedId === r.id ? "bg-white ring-[var(--olivea-olive)]/40" : "bg-white/50 ring-black/5 hover:bg-white/80"}`}
              >
                <span className="block text-sm font-semibold text-stone-800">{r.copy?.eventName?.es || r.id}</span>
                <span className="block text-xs text-stone-500">{r.event_date} · {statusOf(r)}</span>
              </button>
            </li>
          ))}
        </ul>

        {draft && (
          <div className="space-y-5">
            <section className="rounded-2xl bg-white/60 ring-1 ring-black/5 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={LABEL}>{isNew ? t({ es: "Evento nuevo", en: "New event" }) : statusOf(draft)}</span>
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <>
                      <a href={`/es${seriesPath}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--olivea-olive)] hover:underline">
                        {t({ es: "Ver página", en: "View page" })} <ExternalLink className="w-3 h-3" />
                      </a>
                      <button onClick={() => handleToggle(draft)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 bg-white hover:bg-stone-50">
                        {draft.enabled === false ? <><Eye className="w-3.5 h-3.5" /> {t({ es: "Activar", en: "Switch on" })}</> : <><EyeOff className="w-3.5 h-3.5" /> {t({ es: "Ocultar", en: "Hide" })}</>}
                      </button>
                    </>
                  )}
                  <button onClick={handleSave} disabled={saving || !valid} className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] disabled:opacity-50">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} {t({ es: "Guardar", en: "Save" })}
                  </button>
                </div>
              </div>
              {status === "saved" && <p className="text-sm text-emerald-700">{t({ es: "Evento guardado", en: "Event saved" })}</p>}
              {status === "error" && <p className="text-sm text-red-700">{t({ es: "No se pudo guardar — inténtalo de nuevo", en: "Save failed — try again" })}</p>}

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className={LABEL}>{t({ es: "Identificador", en: "ID" })}</span>
                  <input className={INPUT} value={draft.id} disabled={!isNew} placeholder="mesa-invitada-04" onChange={(e) => patch({ id: e.target.value.toLowerCase() })} />
                </label>
                <label className="space-y-1">
                  <span className={LABEL}>{t({ es: "Serie", en: "Series" })}</span>
                  <select className={INPUT} value={draft.series} onChange={(e) => patch({ series: e.target.value })}>
                    {SERIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className={LABEL}>{t({ es: "Fecha", en: "Date" })}</span>
                  <input type="date" className={INPUT} value={draft.event_date} onChange={(e) => patch({ event_date: e.target.value })} />
                </label>
                <label className="space-y-1">
                  <span className={LABEL}>{t({ es: "Precio cena (MXN por persona)", en: "Dinner price (MXN per person)" })}</span>
                  <input type="number" min={0} className={INPUT} value={draft.dinner_price ?? ""} onChange={(e) => patch({ dinner_price: e.target.value === "" ? null : Number(e.target.value) })} />
                </label>
                <label className="space-y-1">
                  <span className={LABEL}>{t({ es: "Precio estancia (MXN, 2 personas)", en: "Stay price (MXN, 2 guests)" })}</span>
                  <input type="number" min={0} className={INPUT} value={draft.stay_price ?? ""} onChange={(e) => patch({ stay_price: e.target.value === "" ? null : Number(e.target.value) })} />
                </label>
                <label className="space-y-1 sm:col-span-3">
                  <span className={LABEL}>{t({ es: "Enlace de reserva (OpenTable)", en: "Booking link (OpenTable)" })}</span>
                  <input className={INPUT} value={draft.booking_url ?? ""} onChange={(e) => patch({ booking_url: e.target.value || null })} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ImageUpload value={draft.poster ?? ""} onChange={(v) => patch({ poster: v || null })} folder="events" label={t({ es: "Cartel", en: "Poster" })} aspectRatio="aspect-[4/5]" />
                <ImageUpload value={draft.share_image ?? ""} onChange={(v) => patch({ share_image: v || null })} folder="events" label={t({ es: "Imagen para compartir", en: "Share image" })} />
              </div>
            </section>

            {COPY_GROUPS.map((g) => (
              <section key={g.title.en} className="rounded-2xl bg-white/60 ring-1 ring-black/5 p-6 space-y-4">
                <span className={LABEL}>{t(g.title)}</span>
                {g.fields.map(([key, label, long]) => (
                  <BilingualField
                    key={key}
                    label={label}
                    value={draft.copy?.[key] ?? EMPTY_BI}
                    onChange={(v) => patchCopy(key, v)}
                    type={long ? "textarea" : "input"}
                  />
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsAdmin() {
  return (
    <SectionGuard sectionKey="content.events">
      <EventsEditor />
    </SectionGuard>
  );
}
