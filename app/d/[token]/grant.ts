// app/d/[token]/grant.ts
// ─────────────────────────────────────────────────────────────────────
// Server-only helper: mint a short-lived access grant for a landing token.
// Called by the landing page (page.tsx) on each scan; the returned atoken
// becomes the rotating ?s=… in the URL. Service-role RPC.
// ─────────────────────────────────────────────────────────────────────

import "server-only";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/config";

export type MintResult = { status: string; atoken: string | null };

export async function mintDocumentGrant(
  landingToken: string,
): Promise<MintResult> {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return { status: "error", atoken: null };
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/mint_document_grant`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _landing_token: landingToken }),
      cache: "no-store",
    });
    if (!res.ok) return { status: "error", atoken: null };
    const raw = await res.json();
    const row = (Array.isArray(raw) ? raw[0] : raw) as {
      status: string;
      atoken: string | null;
    } | null;
    return { status: row?.status ?? "error", atoken: row?.atoken ?? null };
  } catch {
    return { status: "error", atoken: null };
  }
}
