"use server";
// ─────────────────────────────────────────────────────────────────────
// Admin: secure-document management + forensic access log.
//
// All actions are allowlist-gated via requireSectionAccess("settings.securedocs"):
//   · reads  → "viewer"   (see documents + the access log)
//   · writes → "editor"   (create / upload / edit / revoke / delete)
// Enforced server-side, so hiding the UI is never the only gate. Files live in
// the PRIVATE secure-documents bucket and are only ever touched with the
// service-role key; the passcode is bcrypt-hashed in the DB (never in JS).
// ─────────────────────────────────────────────────────────────────────

import { randomUUID } from "node:crypto";
import { requireSectionAccess } from "@/lib/auth/session";
import { selectRows } from "@/lib/supabase/client";
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} from "@/lib/supabase/config";

const SECURE_DOCS_SECTION = "settings.securedocs";
const BUCKET = "secure-documents";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

function svc(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra,
  };
}

/* ── Access log (forensics) ───────────────────────────────────────── */

export interface SecureDocAccessEntry {
  id: string;
  documentId: string;
  documentLabel: string | null;
  viewerName: string | null;
  viewedAt: string;
  ip: string | null;
  userAgent: string | null;
  sessionId: string | null;
  fpHash: string | null;
  client: Record<string, unknown> | null;
  geo: Record<string, unknown> | null;
  acceptLanguage: string | null;
  referer: string | null;
}

interface ViewRow {
  id: string;
  document_id: string;
  viewer_name: string | null;
  viewed_at: string;
  ip: string | null;
  user_agent: string | null;
  session_id: string | null;
  fp_hash: string | null;
  client: Record<string, unknown> | null;
  geo: Record<string, unknown> | null;
  accept_language: string | null;
  referer: string | null;
}

interface DocRow {
  id: string;
  file_name: string | null;
  recipient: string | null;
  token: string | null;
}

export async function getSecureDocAccessLog(limit = 500): Promise<SecureDocAccessEntry[]> {
  await requireSectionAccess(SECURE_DOCS_SECTION, "viewer");
  if (!isSupabaseConfigured) return [];

  const [views, docs] = await Promise.all([
    selectRows<ViewRow>("secure_document_views", {
      role: "service_role",
      query: `order=viewed_at.desc&limit=${limit}`,
    }),
    selectRows<DocRow>("secure_documents", {
      role: "service_role",
      query: "select=id,file_name,recipient,token",
    }),
  ]);

  const docMap = new Map(docs.map((d) => [d.id, d]));
  return views.map((v) => {
    const d = docMap.get(v.document_id);
    return {
      id: v.id,
      documentId: v.document_id,
      documentLabel: d?.file_name ?? d?.recipient ?? (d?.token ? `/d/${d.token}` : null),
      viewerName: v.viewer_name,
      viewedAt: v.viewed_at,
      ip: v.ip,
      userAgent: v.user_agent,
      sessionId: v.session_id,
      fpHash: v.fp_hash,
      client: v.client,
      geo: v.geo,
      acceptLanguage: v.accept_language,
      referer: v.referer,
    };
  });
}

/* ── Document management ──────────────────────────────────────────── */

export interface SecureDocument {
  id: string;
  token: string;
  fileName: string | null;
  recipient: string | null;
  enabled: boolean;
  revoked: boolean;
  hasPasscode: boolean;
  requireName: boolean;
  accessMode: "single_session" | "multi_viewer";
  expiresAt: string | null;
  readWindowSeconds: number;
  grantTtlSeconds: number;
  viewCount: number;
  claimedAt: string | null;
  createdAt: string;
}

interface FullDocRow {
  id: string;
  token: string;
  file_name: string | null;
  recipient: string | null;
  enabled: boolean;
  revoked: boolean;
  passcode_hash: string | null;
  require_name: boolean;
  access_mode: "single_session" | "multi_viewer";
  expires_at: string | null;
  read_window_seconds: number;
  grant_ttl_seconds: number;
  view_count: number;
  claimed_at: string | null;
  created_at: string;
}

function mapDoc(r: FullDocRow, viewCount: number): SecureDocument {
  return {
    id: r.id,
    token: r.token,
    fileName: r.file_name,
    recipient: r.recipient,
    enabled: r.enabled,
    revoked: r.revoked,
    hasPasscode: r.passcode_hash != null,
    requireName: r.require_name,
    accessMode: r.access_mode,
    expiresAt: r.expires_at,
    readWindowSeconds: r.read_window_seconds,
    grantTtlSeconds: r.grant_ttl_seconds,
    viewCount,
    claimedAt: r.claimed_at,
    createdAt: r.created_at,
  };
}

export async function listSecureDocuments(): Promise<SecureDocument[]> {
  await requireSectionAccess(SECURE_DOCS_SECTION, "viewer");
  if (!isSupabaseConfigured) return [];
  // Note: passcode_hash is read to derive hasPasscode but is never returned.
  // secure_documents.view_count is vestigial: open_secure_document_grant records
  // every read into secure_document_views but never touches the counter, so it
  // is written by nothing and the dashboard reported "0 vistas" on documents
  // that had in fact been opened dozens of times — a working document looking
  // broken. Count the rows that actually get written instead. This also makes
  // the historical views visible immediately, with no backfill.
  const [rows, viewRows] = await Promise.all([
    selectRows<FullDocRow>("secure_documents", {
      role: "service_role",
      query:
        "select=id,token,file_name,recipient,enabled,revoked,passcode_hash," +
        "require_name,access_mode,expires_at,read_window_seconds," +
        "grant_ttl_seconds,view_count,claimed_at,created_at&order=created_at.desc",
    }),
    selectRows<{ document_id: string }>("secure_document_views", {
      role: "service_role",
      query: "select=document_id",
    }),
  ]);

  const counts = new Map<string, number>();
  for (const v of viewRows) {
    counts.set(v.document_id, (counts.get(v.document_id) ?? 0) + 1);
  }
  return rows.map((r) => mapDoc(r, counts.get(r.id) ?? 0));
}

export interface CreateDocResult {
  ok: boolean;
  id?: string;
  token?: string;
  error?: string;
}

export async function createSecureDocument(form: FormData): Promise<CreateDocResult> {
  await requireSectionAccess(SECURE_DOCS_SECTION, "editor");
  if (!isSupabaseConfigured) return { ok: false, error: "not_configured" };

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "no_file" };
  if (file.size > MAX_BYTES) return { ok: false, error: "too_large" };
  const contentType = file.type || "application/pdf";
  if (contentType !== "application/pdf") return { ok: false, error: "not_pdf" };

  const recipient = (form.get("recipient") as string | null)?.trim() || null;
  const passcode = (form.get("passcode") as string | null)?.trim() || null;
  const requireName = form.get("requireName") !== "false";
  const accessMode =
    (form.get("accessMode") as string) === "single_session" ? "single_session" : "multi_viewer";
  const expiresAtRaw = (form.get("expiresAt") as string | null)?.trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null;
  const grantTtl = Number(form.get("grantTtlSeconds")) || 900;
  const readWindow = Number(form.get("readWindowSeconds")) || 900;
  const fileName = (form.get("fileName") as string | null)?.trim() || file.name || "document.pdf";

  const storagePath = `${randomUUID()}.pdf`;

  // 1. Upload to the private bucket (service role).
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: svc({ "Content-Type": contentType, "x-upsert": "false" }),
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
  });
  if (!up.ok) {
    console.warn("[secure-doc] upload failed:", up.status);
    return { ok: false, error: "upload_failed" };
  }

  // 2. Create the row (token minted + passcode hashed in the DB).
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_create_secure_document`, {
    method: "POST",
    headers: svc({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      _storage_path: storagePath,
      _file_name: fileName,
      _content_type: contentType,
      _recipient: recipient,
      _passcode: passcode,
      _require_name: requireName,
      _access_mode: accessMode,
      _expires_at: expiresAt,
      _read_window_seconds: readWindow,
      _grant_ttl_seconds: grantTtl,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.warn("[secure-doc] create RPC failed:", res.status);
    // Best-effort cleanup of the orphaned upload.
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
      method: "DELETE",
      headers: svc(),
      cache: "no-store",
    }).catch(() => {});
    return { ok: false, error: "create_failed" };
  }
  const raw = await res.json();
  const row = (Array.isArray(raw) ? raw[0] : raw) as { id: string; token: string } | null;
  if (!row?.token) return { ok: false, error: "create_failed" };
  return { ok: true, id: row.id, token: row.token };
}

export interface DocPatch {
  enabled?: boolean;
  revoked?: boolean;
  recipient?: string | null;
  requireName?: boolean;
  accessMode?: "single_session" | "multi_viewer";
  expiresAt?: string | null;
  grantTtlSeconds?: number;
  readWindowSeconds?: number;
  /** Clear the one-session claim so the doc can be opened fresh again. */
  resetClaim?: boolean;
}

export async function updateSecureDocument(id: string, patch: DocPatch): Promise<{ ok: boolean }> {
  await requireSectionAccess(SECURE_DOCS_SECTION, "editor");
  if (!isSupabaseConfigured) return { ok: false };

  const body: Record<string, unknown> = {};
  if (patch.enabled !== undefined) body.enabled = patch.enabled;
  if (patch.revoked !== undefined) body.revoked = patch.revoked;
  if (patch.recipient !== undefined) body.recipient = patch.recipient;
  if (patch.requireName !== undefined) body.require_name = patch.requireName;
  if (patch.accessMode !== undefined) body.access_mode = patch.accessMode;
  if (patch.expiresAt !== undefined) body.expires_at = patch.expiresAt;
  if (patch.grantTtlSeconds !== undefined) body.grant_ttl_seconds = patch.grantTtlSeconds;
  if (patch.readWindowSeconds !== undefined) body.read_window_seconds = patch.readWindowSeconds;
  if (patch.resetClaim) {
    body.claimed_session_hash = null;
    body.claimed_at = null;
  }
  if (Object.keys(body).length === 0) return { ok: true };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/secure_documents?id=eq.${id}`, {
    method: "PATCH",
    headers: svc({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return { ok: res.ok };
}

export async function setDocumentPasscode(id: string, passcode: string | null): Promise<{ ok: boolean }> {
  await requireSectionAccess(SECURE_DOCS_SECTION, "editor");
  if (!isSupabaseConfigured) return { ok: false };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_set_document_passcode`, {
    method: "POST",
    headers: svc({ "Content-Type": "application/json" }),
    body: JSON.stringify({ _id: id, _passcode: passcode }),
    cache: "no-store",
  });
  return { ok: res.ok };
}

export async function deleteSecureDocument(id: string): Promise<{ ok: boolean }> {
  await requireSectionAccess(SECURE_DOCS_SECTION, "editor");
  if (!isSupabaseConfigured) return { ok: false };

  // Look up the storage path so we can remove the file too.
  const rows = await selectRows<{ storage_path: string }>("secure_documents", {
    role: "service_role",
    query: `id=eq.${id}&select=storage_path`,
  });
  const path = rows[0]?.storage_path;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/secure_documents?id=eq.${id}`, {
    method: "DELETE",
    headers: svc({ Prefer: "return=minimal" }),
    cache: "no-store",
  });
  if (path) {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: svc(),
      cache: "no-store",
    }).catch(() => {});
  }
  return { ok: res.ok };
}
