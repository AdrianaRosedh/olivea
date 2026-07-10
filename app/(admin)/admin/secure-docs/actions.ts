"use server";
// ─────────────────────────────────────────────────────────────────────
// Admin: read the secure-document access log (forensics).
//
// Service-role read, gated to manager+ — this is sensitive PII (names, IPs,
// geo, device fingerprints of everyone who signed in). Each view is joined to
// its document for a human-readable label. Mirrors the audit-log gating
// (getAuditLog → requireRole("manager")).
// ─────────────────────────────────────────────────────────────────────

import { requireRole } from "@/lib/auth/session";
import { selectRows } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
  // Sensitive forensic data — managers and owners only.
  await requireRole("manager");
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
