// lib/auth/audit.ts
// ─────────────────────────────────────────────────────────────────────
// Audit logging helper. Call from any admin server action that mutates
// data. Failures are non-blocking — we never break a save just because
// the audit insert hit an error.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { insertRows } from "@/lib/supabase/client";
import { getSession } from "./session";

interface AuditEntry {
  /** Verb describing the change: "create" | "update" | "delete" | "publish" | "toggle" | etc. */
  action: string;
  /** What kind of thing was changed: "popup" | "banner" | "journal_post" | "casa_content" | etc. */
  resourceType?: string;
  /** Identifier of the changed thing, when applicable */
  resourceId?: string;
  /** Anything else worth recording (diff summary, before→after, etc.) */
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const user = await getSession();
    await insertRows("admin_audit_log", {
      user_id: user?.id ?? null,
      action: entry.action,
      resource_type: entry.resourceType ?? null,
      resource_id: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    // Never let audit logging break the calling action.
    console.error("[audit] logAudit failed:", err);
  }
}
