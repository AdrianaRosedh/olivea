// app/d/[token]/actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server action behind the secure-document sign-in. A worker scanning the
// wall QR submits their NAME + the shared PASSCODE; this:
//   1. Verifies the passcode + requires a name via the service-role-only
//      RPC open_secure_document (bcrypt check, rate-limited, LOGS the view).
//   2. On success, downloads the bytes from the PRIVATE bucket (service
//      role) and returns them + the entered name (for the watermark).
// The raw storage URL never reaches the browser. Matches the repo's
// REST-only Supabase style.
// ─────────────────────────────────────────────────────────────────────

"use server";

import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/config";

const SID_PREFIX = "sdsid_";
const SID_MAX_AGE = 60 * 60 * 24 * 30; // 30d — just a stable per-browser id for the log

type OpenStatus =
  | "ok"
  | "bad_passcode"
  | "name_required"
  | "rate_limited"
  | "link_expired"
  | "expired"
  | "revoked"
  | "disabled"
  | "not_found";

export type OpenSecureDocResult =
  | {
      ok: true;
      data: string; // base64 PDF bytes
      contentType: string;
      fileName: string | null;
      viewerName: string;
      grantedAt: string;
    }
  | { ok: false; status: OpenStatus | "error"; remaining?: number | null };

function svcHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
}

export type ClientFingerprint = Record<string, unknown> & { hash?: string };

export async function openSecureDocument(
  grant: string,
  name: string,
  passcode: string,
  fingerprint?: ClientFingerprint | null,
): Promise<OpenSecureDocResult> {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return { ok: false, status: "error" };
    }

    // Stable per-browser session id (for the access log; not a secret).
    const sidCookie =
      SID_PREFIX + createHash("sha256").update(grant).digest("hex").slice(0, 12);
    const jar = await cookies();
    let sid = jar.get(sidCookie)?.value;
    if (!sid) {
      sid = randomBytes(12).toString("hex");
      jar.set(sidCookie, sid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/d",
        maxAge: SID_MAX_AGE,
      });
    }

    const hdrs = await headers();
    const fwd = hdrs.get("x-forwarded-for") ?? "";
    const ip = fwd.split(",")[0]?.trim() || hdrs.get("x-real-ip") || null;
    const ua = hdrs.get("user-agent") ?? null;
    const acceptLanguage = hdrs.get("accept-language") ?? null;
    const referer = hdrs.get("referer") ?? null;
    // Vercel edge geo (from the IP — no client permission needed). Present on
    // production; null locally. `forwarded` keeps the full proxy chain.
    const rawCity = hdrs.get("x-vercel-ip-city");
    const geo = {
      country: hdrs.get("x-vercel-ip-country"),
      region: hdrs.get("x-vercel-ip-country-region"),
      city: rawCity ? decodeURIComponent(rawCity) : null,
      latitude: hdrs.get("x-vercel-ip-latitude"),
      longitude: hdrs.get("x-vercel-ip-longitude"),
      timezone: hdrs.get("x-vercel-ip-timezone"),
      forwarded: fwd || null,
    };

    // 1. Verify grant (rotating link) + passcode + name, and LOG the view.
    const rpcRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/open_secure_document_grant`,
      {
        method: "POST",
        headers: { ...svcHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          _grant: grant,
          _passcode: passcode,
          _name: name,
          _session: sid,
          _ip: ip,
          _ua: ua,
          _client: fingerprint ?? null,
          _geo: geo,
          _fp_hash: fingerprint?.hash ?? null,
          _accept_language: acceptLanguage,
          _referer: referer,
        }),
        cache: "no-store",
      },
    );
    if (!rpcRes.ok) {
      console.warn("[secure-doc] open RPC failed:", rpcRes.status);
      return { ok: false, status: "error" };
    }
    const raw = await rpcRes.json();
    const row = (Array.isArray(raw) ? raw[0] : raw) as {
      status: OpenStatus;
      storage_path: string | null;
      content_type: string | null;
      file_name: string | null;
      viewer_name: string | null;
      remaining_attempts: number | null;
    } | null;

    const status = row?.status ?? "not_found";
    if (status !== "ok" || !row?.storage_path) {
      return {
        ok: false,
        status: status as OpenStatus,
        remaining: row?.remaining_attempts ?? null,
      };
    }

    // 2. Download the private file (service role).
    const dl = await fetch(
      `${SUPABASE_URL}/storage/v1/object/secure-documents/${row.storage_path}`,
      { headers: svcHeaders(), cache: "no-store" },
    );
    if (!dl.ok) {
      console.warn("[secure-doc] download failed:", dl.status);
      return { ok: false, status: "error" };
    }
    const buf = Buffer.from(await dl.arrayBuffer());

    return {
      ok: true,
      data: buf.toString("base64"),
      contentType: row.content_type ?? "application/pdf",
      fileName: row.file_name ?? null,
      viewerName: row.viewer_name ?? name.trim(),
      grantedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn("[secure-doc] open error:", e);
    return { ok: false, status: "error" };
  }
}
