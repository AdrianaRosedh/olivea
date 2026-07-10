"use client";

// ─────────────────────────────────────────────────────────────────────
// Document Access — the forensic sign-in log for secure documents.
// Shows who opened each document: name, time, location (IP geo), device,
// and the full passively-collected fingerprint. Flags when one device
// signed in under several different names (a likely fake name).
// Manager+ only (SectionGuard + the action's requireRole("manager")).
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Fingerprint,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MapPin,
  Monitor,
  Globe2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  FileText,
} from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import { useAdminLocale, STR } from "@/lib/admin/i18n";
import { getSecureDocAccessLog, type SecureDocAccessEntry } from "./actions";

/* ── Helpers (module scope — no t() here) ─────────────────────────── */

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : v == null ? null : String(v);
}

/** ISO-3166 alpha-2 → regional-indicator flag emoji. */
function flagEmoji(country?: string | null): string {
  if (!country || country.length !== 2) return "🌐";
  const cc = country.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "🌐";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Minimal, dependency-free browser + OS from a UA string. */
function parseUA(ua: string | null): string {
  if (!ua) return "—";
  let os = "";
  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Linux/.test(ua)) os = "Linux";
  let br = "";
  if (/Edg\//.test(ua)) br = "Edge";
  else if (/OPR\/|Opera/.test(ua)) br = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) br = "Chrome";
  else if (/CriOS/.test(ua)) br = "Chrome";
  else if (/Firefox\//.test(ua) || /FxiOS/.test(ua)) br = "Firefox";
  else if (/Safari\//.test(ua)) br = "Safari";
  return [br, os].filter(Boolean).join(" · ") || "—";
}

function relativeTime(iso: string, es: boolean): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(0, Math.round((now - then) / 1000));
  const m = Math.round(s / 60);
  const h = Math.round(m / 60);
  const d = Math.round(h / 24);
  if (s < 60) return es ? "hace un momento" : "just now";
  if (m < 60) return es ? `hace ${m} min` : `${m} min ago`;
  if (h < 24) return es ? `hace ${h} h` : `${h}h ago`;
  return es ? `hace ${d} d` : `${d}d ago`;
}

function formatTimestamp(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function geoLine(geo: Record<string, unknown> | null): string {
  if (!geo) return "—";
  const parts = [str(geo.city), str(geo.region), str(geo.country)].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

/* ── Detail row ───────────────────────────────────────────────────── */

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wider text-stone-400">{label}</dt>
      <dd className={`text-[12px] text-stone-700 break-words ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

/* ── One sign-in row ──────────────────────────────────────────────── */

function AccessRow({
  entry,
  suspicious,
  deviceNameCount,
}: {
  entry: SecureDocAccessEntry;
  suspicious: boolean;
  deviceNameCount: number;
}) {
  const [open, setOpen] = useState(false);
  const { locale, t } = useAdminLocale();
  const es = locale === "es";
  const c = entry.client ?? {};
  const g = entry.geo ?? {};
  const screen = str(c.screen);
  const viewport = str(c.viewport);

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${
        suspicious
          ? "border-amber-300/70 bg-amber-50/40"
          : "border-stone-200/70 bg-white/60"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-50/60 transition-colors"
      >
        <span className="mt-0.5 text-stone-400">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[var(--olivea-ink)]">
              {entry.viewerName || (es ? "(sin nombre)" : "(no name)")}
            </span>
            {suspicious && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                <AlertTriangle className="w-3 h-3" />
                {es ? `mismo equipo · ${deviceNameCount} nombres` : `same device · ${deviceNameCount} names`}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-stone-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {relativeTime(entry.viewedAt, es)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {flagEmoji(str(g.country))} {geoLine(entry.geo)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              {entry.ip ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Monitor className="w-3 h-3" /> {parseUA(entry.userAgent)}
            </span>
            {entry.documentLabel && (
              <span className="inline-flex items-center gap-1">
                <FileText className="w-3 h-3" /> {entry.documentLabel}
              </span>
            )}
          </div>
        </div>

        {entry.fpHash && (
          <span
            className="shrink-0 self-center font-mono text-[10px] px-2 py-1 rounded-md bg-stone-100 text-stone-500"
            title={t({ es: "Huella del dispositivo", en: "Device fingerprint" })}
          >
            <Fingerprint className="w-3 h-3 inline mr-1 -mt-0.5" />
            {entry.fpHash.slice(0, 10)}
          </span>
        )}
      </button>

      {open && (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 px-4 pb-4 pt-1 border-t border-stone-200/60">
          <Field label={t({ es: "Fecha y hora", en: "Timestamp" })} value={formatTimestamp(entry.viewedAt, es ? "es-MX" : "en-US")} />
          <Field label={t({ es: "Documento", en: "Document" })} value={entry.documentLabel} />
          <Field label="IP" value={entry.ip} mono />
          <Field label={t({ es: "Coordenadas", en: "Coordinates" })} value={str(g.latitude) && str(g.longitude) ? `${str(g.latitude)}, ${str(g.longitude)}` : null} mono />
          <Field label={t({ es: "Zona horaria", en: "Timezone" })} value={str(g.timezone) ?? str(c.timezone)} />
          <Field label={t({ es: "Idiomas", en: "Languages" })} value={str(c.languages) ?? str(c.language) ?? entry.acceptLanguage} />
          <Field label={t({ es: "Plataforma", en: "Platform" })} value={str(c.platform)} />
          <Field label={t({ es: "Pantalla", en: "Screen" })} value={screen} mono />
          <Field label={t({ es: "Ventana", en: "Viewport" })} value={viewport} mono />
          <Field label={t({ es: "Núcleos CPU", en: "CPU cores" })} value={str(c.cores)} />
          <Field label={t({ es: "Memoria", en: "Memory" })} value={str(c.memoryGB) ? `${str(c.memoryGB)} GB` : null} />
          <Field label={t({ es: "Puntos táctiles", en: "Touch points" })} value={str(c.touchPoints)} />
          <Field label="GPU" value={[str(c.gpuVendor), str(c.gpuRenderer)].filter(Boolean).join(" · ") || null} />
          <Field label={t({ es: "Conexión", en: "Connection" })} value={str(c.connection)} />
          <Field label={t({ es: "Hash canvas", en: "Canvas hash" })} value={str(c.canvasHash)} mono />
          <Field label={t({ es: "Huella dispositivo", en: "Device fingerprint" })} value={entry.fpHash} mono />
          <Field label={t({ es: "ID de sesión", en: "Session ID" })} value={entry.sessionId} mono />
          <Field label="Referer" value={entry.referer ?? str(c.referrer)} />
          <div className="col-span-2 md:col-span-4">
            <Field label={t({ es: "Navegador (completo)", en: "User agent (full)" })} value={entry.userAgent} mono />
          </div>
        </dl>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

function SecureDocsAccessLog() {
  const { t } = useAdminLocale();
  const [entries, setEntries] = useState<SecureDocAccessEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [docFilter, setDocFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      try {
        setEntries(await getSecureDocAccessLog(500));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load access log");
      }
    });
  };

  useEffect(() => {
    load();
  }, []);

  // Map fp_hash → set of distinct names (per the migration: catch one device
  // signing in under several names). >1 name on a device = suspicious.
  const deviceNames = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of entries) {
      if (!e.fpHash) continue;
      const name = (e.viewerName ?? "").trim().toLowerCase();
      if (!m.has(e.fpHash)) m.set(e.fpHash, new Set());
      if (name) m.get(e.fpHash)!.add(name);
    }
    return m;
  }, [entries]);

  const flaggedDevices = useMemo(
    () => [...deviceNames.entries()].filter(([, names]) => names.size > 1),
    [deviceNames],
  );

  const docs = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of entries) m.set(e.documentId, e.documentLabel ?? e.documentId.slice(0, 8));
    return [...m.entries()];
  }, [entries]);

  const shown = useMemo(
    () => (docFilter === "all" ? entries : entries.filter((e) => e.documentId === docFilter)),
    [entries, docFilter],
  );

  const distinctDevices = new Set(entries.map((e) => e.fpHash).filter(Boolean)).size;
  const distinctNames = new Set(entries.map((e) => (e.viewerName ?? "").trim().toLowerCase()).filter(Boolean)).size;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/[0.08] flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-[var(--olivea-olive)]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--olivea-ink)]">
              {t({ es: "Acceso a Documentos", en: "Document Access" })}
            </h1>
            <p className="text-sm text-[var(--olivea-clay)]">
              {t({
                es: "Quién abrió cada documento seguro — nombre, ubicación, dispositivo y huella.",
                en: "Who opened each secure document — name, location, device, and fingerprint.",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          {t(STR.reload)}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: t({ es: "Accesos", en: "Sign-ins" }), value: entries.length },
          { label: t({ es: "Dispositivos", en: "Devices" }), value: distinctDevices },
          { label: t({ es: "Nombres", en: "Names" }), value: distinctNames },
          { label: t({ es: "Documentos", en: "Documents" }), value: docs.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200/70 bg-white/50 px-4 py-3">
            <div className="text-2xl font-semibold text-[var(--olivea-ink)]">{s.value}</div>
            <div className="text-[11px] text-stone-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Fake-name warning */}
      {flaggedDevices.length > 0 && (
        <div className="mb-5 rounded-xl border border-amber-300/70 bg-amber-50/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <ShieldAlert className="w-4 h-4" />
            {t({
              es: `${flaggedDevices.length} dispositivo${flaggedDevices.length > 1 ? "s" : ""} usó varios nombres`,
              en: `${flaggedDevices.length} device${flaggedDevices.length > 1 ? "s" : ""} used multiple names`,
            })}
          </div>
          <p className="text-[11px] text-amber-700/90 mt-1">
            {t({
              es: "La misma huella de dispositivo inició sesión con nombres distintos — posible nombre falso.",
              en: "The same device fingerprint signed in under different names — a possible fake name.",
            })}
          </p>
          <ul className="mt-2 space-y-1">
            {flaggedDevices.map(([fp, names]) => (
              <li key={fp} className="text-[11px] text-amber-800 flex items-center gap-2 flex-wrap">
                <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">{fp.slice(0, 10)}</span>
                <span>→</span>
                <span className="font-medium">{[...names].join(", ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Document filter */}
      {docs.length > 1 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-stone-500 flex items-center gap-1">
            <Globe2 className="w-3 h-3" /> {t({ es: "Documento:", en: "Document:" })}
          </span>
          <button
            onClick={() => setDocFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${docFilter === "all" ? "bg-[var(--olivea-olive)] text-white" : "bg-white/60 text-stone-600 hover:bg-white"}`}
          >
            {t({ es: "Todos", en: "All" })}
          </button>
          {docs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setDocFilter(id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium truncate max-w-[200px] ${docFilter === id ? "bg-[var(--olivea-olive)] text-white" : "bg-white/60 text-stone-600 hover:bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Log */}
      <div className="space-y-2">
        {shown.map((e) => {
          const names = e.fpHash ? deviceNames.get(e.fpHash) : null;
          const count = names?.size ?? 0;
          return (
            <AccessRow key={e.id} entry={e} suspicious={count > 1} deviceNameCount={count} />
          );
        })}
        {!isPending && shown.length === 0 && !error && (
          <div className="text-center py-16 text-stone-400 text-sm">
            {t({ es: "Aún no hay accesos registrados.", en: "No sign-ins logged yet." })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SecureDocsAccessLogPage() {
  return (
    <SectionGuard sectionKey="settings.securedocs" minAccess="viewer">
      <SecureDocsAccessLog />
    </SectionGuard>
  );
}
