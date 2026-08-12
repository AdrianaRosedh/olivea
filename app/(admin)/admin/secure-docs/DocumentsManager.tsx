"use client";

// ─────────────────────────────────────────────────────────────────────
// Documents tab of the secure-document console: create/upload documents,
// see their status, get the printed QR (→ olivea.ai/d/<token>), and manage
// them (passcode, expiry, revoke, reset claim, delete). Modify controls are
// shown only to editors (canModify); every mutation is re-checked server-side.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  RefreshCw,
  Upload,
  Trash2,
  Ban,
  RotateCcw,
  KeyRound,
  Copy,
  Check,
  Download,
  Loader2,
  Lock,
  Eye,
  Power,
  CalendarClock,
} from "lucide-react";
import { useAdminLocale, STR } from "@/lib/admin/i18n";
import {
  listSecureDocuments,
  createSecureDocument,
  updateSecureDocument,
  setDocumentPasscode,
  deleteSecureDocument,
  type SecureDocument,
} from "./actions";
import { SECURE_DOC_BASE_URL } from "./constants";
import { useConfirm } from "@/components/admin/ConfirmDialog";

function docUrl(token: string): string {
  return `${SECURE_DOC_BASE_URL}/d/${token}`;
}

/** ISO → value for a <input type="datetime-local"> in the viewer's local time. */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type DocStatus = { label: { es: string; en: string }; cls: string };

function statusOf(d: SecureDocument): DocStatus {
  if (d.revoked) return { label: { es: "Revocado", en: "Revoked" }, cls: "bg-red-50 text-red-700 border-red-200" };
  if (!d.enabled) return { label: { es: "Desactivado", en: "Disabled" }, cls: "bg-stone-100 text-stone-600 border-stone-200" };
  if (d.expiresAt && new Date(d.expiresAt).getTime() < Date.now())
    return { label: { es: "Expirado", en: "Expired" }, cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (d.accessMode === "single_session" && d.claimedAt)
    return { label: { es: "Reclamado", en: "Claimed" }, cls: "bg-violet-50 text-violet-700 border-violet-200" };
  return { label: { es: "Activo", en: "Active" }, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

/* ── QR block (copy + download) ───────────────────────────────────── */

function QrBlock({ token }: { token: string }) {
  const { t } = useAdminLocale();
  const url = docUrl(token);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const downloadSvg = () => {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `olivea-doc-${token.slice(0, 8)}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex items-center gap-3">
      <div ref={wrapRef} className="rounded-lg bg-white p-2 border border-stone-200 shrink-0">
        <QRCodeSVG value={url} size={96} level="M" marginSize={1} />
      </div>
      <div className="min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-mono text-[11px] text-[var(--olivea-olive)] hover:underline break-all"
        >
          {url}
        </a>
        <div className="mt-1.5 flex items-center gap-1.5">
          <button onClick={copy} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[11px] hover:bg-stone-200 transition-colors">
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? t({ es: "Copiado", en: "Copied" }) : t({ es: "Copiar enlace", en: "Copy link" })}
          </button>
          <button onClick={downloadSvg} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[11px] hover:bg-stone-200 transition-colors">
            <Download className="w-3 h-3" /> {t({ es: "Descargar QR", en: "Download QR" })}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create form ──────────────────────────────────────────────────── */

function CreateForm({ onDone }: { onDone: () => void }) {
  const { t } = useAdminLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  const submit = () => {
    setError(null);
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    start(async () => {
      const res = await createSecureDocument(fd);
      if (res.ok) onDone();
      else setError(res.error ?? "error");
    });
  };

  const errMsg =
    error === "no_file" ? t({ es: "Elige un PDF.", en: "Choose a PDF." })
    : error === "too_large" ? t({ es: "El archivo supera 25 MB.", en: "File exceeds 25 MB." })
    : error === "not_pdf" ? t({ es: "Solo se permiten archivos PDF.", en: "Only PDF files are allowed." })
    : error ? t({ es: "No se pudo crear el documento.", en: "Could not create the document." })
    : null;

  return (
    <form ref={formRef} className="rounded-2xl border border-[var(--olivea-olive)]/[0.12] bg-white/70 p-5 mb-5 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="md:col-span-2 block">
          <span className="text-[11px] uppercase tracking-wider text-stone-500">{t({ es: "Archivo PDF", en: "PDF file" })}</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="file" name="file" accept="application/pdf" required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--olivea-olive)] file:text-white file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-[var(--olivea-clay)]"
            />
          </div>
          {fileName && <span className="text-[11px] text-stone-400 mt-1 inline-block">{fileName}</span>}
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-500">{t({ es: "Destinatario (marca de agua)", en: "Recipient (watermark)" })}</span>
          <input name="recipient" type="text" placeholder="OLIVEA" className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-stone-300 bg-white/70 outline-none focus:ring-1 focus:ring-[var(--olivea-olive)]" />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-500">{t({ es: "Código de acceso (opcional)", en: "Passcode (optional)" })}</span>
          <input name="passcode" type="text" autoComplete="off" placeholder="••••" className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-stone-300 bg-white/70 outline-none focus:ring-1 focus:ring-[var(--olivea-olive)]" />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-500">{t({ es: "Expira (vacío = nunca)", en: "Expires (empty = never)" })}</span>
          <input name="expiresAt" type="datetime-local" className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-stone-300 bg-white/70 outline-none focus:ring-1 focus:ring-[var(--olivea-olive)]" />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-500">{t({ es: "Modo de acceso", en: "Access mode" })}</span>
          <select name="accessMode" defaultValue="multi_viewer" className="mt-1 w-full text-sm px-3 py-2 rounded-lg border border-stone-300 bg-white/70 outline-none focus:ring-1 focus:ring-[var(--olivea-olive)]">
            <option value="multi_viewer">{t({ es: "Varios lectores (con nombre + código)", en: "Multiple viewers (name + passcode)" })}</option>
            <option value="single_session">{t({ es: "Una sola sesión (se consume al abrir)", en: "Single session (consumed on open)" })}</option>
          </select>
        </label>

        <label className="flex items-center gap-2 mt-5">
          <input name="requireName" type="checkbox" defaultChecked value="true" className="rounded border-stone-300" />
          <span className="text-xs text-stone-600">{t({ es: "Pedir nombre al abrir", en: "Require a name on open" })}</span>
        </label>
      </div>

      {errMsg && <div className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{errMsg}</div>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="px-3 py-2 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100">
          {t(STR.cancel)}
        </button>
        <button type="button" onClick={submit} disabled={pending} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--olivea-olive)] text-white text-sm font-medium hover:shadow-md disabled:opacity-50">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {t({ es: "Crear documento", en: "Create document" })}
        </button>
      </div>
    </form>
  );
}

/* ── Document card ────────────────────────────────────────────────── */

function DocCard({ doc, canModify, onChanged }: { doc: SecureDocument; canModify: boolean; onChanged: () => void }) {
  const confirm = useConfirm();
  const { locale, t } = useAdminLocale();
  const [busy, setBusy] = useState(false);
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [expiryInput, setExpiryInput] = useState("");
  const st = statusOf(doc);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); onChanged(); } finally { setBusy(false); }
  };

  const changePasscode = () => {
    const v = window.prompt(t({ es: "Nuevo código (vacío = quitar):", en: "New passcode (empty = remove):" }), "");
    if (v === null) return;
    run(() => setDocumentPasscode(doc.id, v.trim() || null));
  };

  const remove = async () => {
    const ok = await confirm({
      tone: "danger",
      title: { es: "¿Eliminar este documento?", en: "Delete this document?" },
      body: {
        es: "Se borra el registro y su archivo. No se puede deshacer.",
        en: "The record and its file are deleted. This cannot be undone.",
      },
    });
    if (!ok) return;
    run(() => deleteSecureDocument(doc.id));
  };

  const openExpiry = () => {
    setExpiryInput(toDatetimeLocal(doc.expiresAt));
    setEditingExpiry(true);
  };
  const commitExpiry = async (value: string | null) => {
    await run(() => updateSecureDocument(doc.id, { expiresAt: value }));
    setEditingExpiry(false);
  };
  const plusDays = (n: number) => commitExpiry(new Date(Date.now() + n * 86_400_000).toISOString());

  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/60 p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[var(--olivea-ink)] truncate">{doc.fileName || doc.token.slice(0, 8)}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${st.cls}`}>{t(st.label)}</span>
            {doc.hasPasscode && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-stone-500"><Lock className="w-3 h-3" /> {t({ es: "código", en: "passcode" })}</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-stone-500">
            {doc.recipient && <span>{t({ es: "Marca de agua", en: "Watermark" })}: {doc.recipient}</span>}
            <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {doc.viewCount} {t({ es: "vistas", en: "views" })}</span>
            <span>{doc.accessMode === "single_session" ? t({ es: "Una sesión", en: "Single session" }) : t({ es: "Varios lectores", en: "Multi-viewer" })}</span>
            <span>
              {doc.expiresAt
                ? `${t({ es: "Expira", en: "Expires" })}: ${new Date(doc.expiresAt).toLocaleString(locale === "es" ? "es-MX" : "en-US", { dateStyle: "medium", timeStyle: "short" })}`
                : t({ es: "Nunca expira", en: "Never expires" })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <QrBlock token={doc.token} />
      </div>

      {canModify && (
        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-2 flex-wrap">
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />}
          <button onClick={() => run(() => updateSecureDocument(doc.id, { enabled: !doc.enabled }))} disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-50">
            <Power className="w-3 h-3" /> {doc.enabled ? t({ es: "Desactivar", en: "Disable" }) : t({ es: "Activar", en: "Enable" })}
          </button>
          <button onClick={() => run(() => updateSecureDocument(doc.id, { revoked: !doc.revoked }))} disabled={busy}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium disabled:opacity-50 ${doc.revoked ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
            <Ban className="w-3 h-3" /> {doc.revoked ? t({ es: "Restaurar", en: "Un-revoke" }) : t({ es: "Revocar", en: "Revoke" })}
          </button>
          {doc.accessMode === "single_session" && doc.claimedAt && (
            <button onClick={() => run(() => updateSecureDocument(doc.id, { resetClaim: true }))} disabled={busy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-50">
              <RotateCcw className="w-3 h-3" /> {t({ es: "Reabrir sesión", en: "Reset claim" })}
            </button>
          )}
          <button onClick={changePasscode} disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-50">
            <KeyRound className="w-3 h-3" /> {doc.hasPasscode ? t({ es: "Cambiar código", en: "Change passcode" }) : t({ es: "Poner código", en: "Set passcode" })}
          </button>
          <button onClick={openExpiry} disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-50">
            <CalendarClock className="w-3 h-3" /> {t({ es: "Vencimiento", en: "Expiry" })}
          </button>
          <button onClick={remove} disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto">
            <Trash2 className="w-3 h-3" /> {t(STR.delete)}
          </button>
        </div>
      )}

      {canModify && editingExpiry && (
        <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-stone-600">{t({ es: "Cambiar vencimiento", en: "Change expiry" })}</span>
            <button onClick={() => setEditingExpiry(false)} className="text-[11px] text-stone-400 hover:text-stone-600">
              {t(STR.cancel)}
            </button>
          </div>

          {/* Quick options */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => commitExpiry(null)} disabled={busy}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
              {t({ es: "Nunca expira", en: "Never" })}
            </button>
            {([[30, { es: "30 días", en: "30 days" }], [90, { es: "90 días", en: "90 days" }], [180, { es: "6 meses", en: "6 months" }], [365, { es: "1 año", en: "1 year" }]] as const).map(([days, label]) => (
              <button key={days} onClick={() => plusDays(days)} disabled={busy}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-50">
                +{t(label)}
              </button>
            ))}
          </div>

          {/* Exact date via the calendar picker */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-stone-500">{t({ es: "o una fecha exacta:", en: "or an exact date:" })}</span>
            <input
              type="datetime-local"
              value={expiryInput}
              onChange={(e) => setExpiryInput(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 outline-none focus:ring-1 focus:ring-[var(--olivea-olive)]"
            />
            <button onClick={() => commitExpiry(expiryInput ? new Date(expiryInput).toISOString() : null)} disabled={busy || !expiryInput}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--olivea-olive)] text-white hover:shadow-sm disabled:opacity-50">
              {t({ es: "Guardar", en: "Save" })}
            </button>
          </div>

          <p className="text-[10px] text-stone-400 mt-2">{t({ es: "El QR y el enlace no cambian.", en: "The QR and link stay the same." })}</p>
        </div>
      )}
    </div>
  );
}

/* ── Tab ──────────────────────────────────────────────────────────── */

export default function DocumentsManager({ canModify }: { canModify: boolean }) {
  const { t } = useAdminLocale();
  const [docs, setDocs] = useState<SecureDocument[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const load = () => {
    start(async () => {
      try { setDocs(await listSecureDocuments()); setError(null); }
      catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    });
  };
  useEffect(load, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--olivea-clay)]">
          {docs.length} {t(docs.length === 1 ? { es: "documento", en: "document" } : { es: "documentos", en: "documents" })}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={pending} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${pending ? "animate-spin" : ""}`} /> {t(STR.reload)}
          </button>
          {canModify && !creating && (
            <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--olivea-olive)] text-white text-xs font-medium hover:shadow-md">
              <Plus className="w-3.5 h-3.5" /> {t({ es: "Nuevo documento", en: "New document" })}
            </button>
          )}
        </div>
      </div>

      {creating && <CreateForm onDone={() => { setCreating(false); load(); }} />}
      {error && <div className="mb-4 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="space-y-3">
        {docs.map((d) => <DocCard key={d.id} doc={d} canModify={canModify} onChanged={load} />)}
        {!pending && docs.length === 0 && !creating && (
          <div className="text-center py-16 text-stone-400 text-sm">
            {canModify
              ? t({ es: 'Aún no hay documentos. Crea el primero con "Nuevo documento".', en: 'No documents yet. Create the first with "New document".' })
              : t({ es: "Aún no hay documentos.", en: "No documents yet." })}
          </div>
        )}
      </div>
    </div>
  );
}
