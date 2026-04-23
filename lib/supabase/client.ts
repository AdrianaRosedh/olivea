// lib/supabase/client.ts
// ─────────────────────────────────────────────────────────────────────
// Lightweight Supabase PostgREST client — no @supabase/supabase-js dep.
// Uses the standard PostgREST API that Supabase exposes. All admin
// writes go through server actions using the service role key.
// ─────────────────────────────────────────────────────────────────────

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from "./config";

type Role = "anon" | "service_role";

/** Validate that a string is a UUID v4 (prevents PostgREST filter injection) */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function assertUUID(value: string, label = "id"): void {
  if (!UUID_RE.test(value)) {
    throw new Error(`Invalid UUID for ${label}: ${value}`);
  }
}

function headers(role: Role): Record<string, string> {
  const key = role === "service_role" ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function restUrl(table: string): string {
  return `${SUPABASE_URL}/rest/v1/${table}`;
}

// ── Query helpers ───────────────────────────────────────────────────

/** SELECT rows — returns parsed JSON array */
export async function selectRows<T = Record<string, unknown>>(
  table: string,
  opts?: {
    role?: Role;
    query?: string;     // PostgREST query params (e.g. "enabled=eq.true&order=priority.desc")
    single?: boolean;   // Expect a single row
    revalidate?: number; // ISR revalidation in seconds (default: no-store)
  }
): Promise<T[]> {
  const role = opts?.role ?? "anon";
  const url = opts?.query ? `${restUrl(table)}?${opts.query}` : restUrl(table);
  const hdrs = headers(role);
  if (opts?.single) hdrs.Accept = "application/vnd.pgrst.object+json";
  else hdrs.Accept = "application/json";

  // Use ISR-friendly caching when revalidate is set, otherwise no-store for admin reads
  const fetchOpts: RequestInit = { headers: hdrs };
  if (opts?.revalidate !== undefined) {
    fetchOpts.next = { revalidate: opts.revalidate };
  } else {
    fetchOpts.cache = "no-store";
  }

  const res = await fetch(url, fetchOpts);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase SELECT ${table} failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return opts?.single ? [data as T] : (data as T[]);
}

/** SELECT a single row by primary key */
export async function selectOne<T = Record<string, unknown>>(
  table: string,
  id: string,
  opts?: { role?: Role; idColumn?: string; revalidate?: number }
): Promise<T | null> {
  const col = opts?.idColumn ?? "id";
  const rows = await selectRows<T>(table, {
    role: opts?.role ?? "anon",
    query: `${col}=eq.${encodeURIComponent(id)}`,
    single: true,
    revalidate: opts?.revalidate,
  });
  return rows[0] ?? null;
}

/** INSERT one or more rows (service_role only) */
export async function insertRows<T = Record<string, unknown>>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[]
): Promise<T[]> {
  const res = await fetch(restUrl(table), {
    method: "POST",
    headers: headers("service_role"),
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase INSERT ${table} failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** UPDATE rows matching a filter (service_role only) */
export async function updateRows<T = Record<string, unknown>>(
  table: string,
  filter: string,   // e.g. "id=eq.my-row-id"
  data: Record<string, unknown>
): Promise<T[]> {
  const res = await fetch(`${restUrl(table)}?${filter}`, {
    method: "PATCH",
    headers: headers("service_role"),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase UPDATE ${table} failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** UPSERT (insert or update on conflict) */
export async function upsertRows<T = Record<string, unknown>>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
  opts?: { onConflict?: string }
): Promise<T[]> {
  const hdrs = {
    ...headers("service_role"),
    Prefer: "return=representation,resolution=merge-duplicates",
  };
  const url = opts?.onConflict
    ? `${restUrl(table)}?on_conflict=${opts.onConflict}`
    : restUrl(table);

  const res = await fetch(url, {
    method: "POST",
    headers: hdrs,
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase UPSERT ${table} failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** COUNT rows using PostgREST Prefer: count=exact header (O(1) vs fetching all rows) */
export async function countRows(
  table: string,
  opts?: { role?: Role; filter?: string }
): Promise<number> {
  const role = opts?.role ?? "service_role";
  const query = opts?.filter ? `${opts.filter}&select=id` : "select=id";
  const url = `${restUrl(table)}?${query}`;
  const hdrs: Record<string, string> = {
    ...headers(role),
    Prefer: "count=exact",
    "Range-Unit": "items",
    Range: "0-0",           // fetch zero rows, just need the count header
    Accept: "application/json",
  };

  const res = await fetch(url, { headers: hdrs, cache: "no-store" });
  if (!res.ok) return 0;

  // PostgREST returns content-range: 0-0/42  (or */42 if no rows)
  const contentRange = res.headers.get("content-range");
  if (contentRange) {
    const total = contentRange.split("/")[1];
    if (total && total !== "*") return parseInt(total, 10);
  }
  return 0;
}

/** DELETE rows matching a filter (service_role only) */
export async function deleteRows(
  table: string,
  filter: string    // e.g. "id=eq.my-row-id"
): Promise<void> {
  const res = await fetch(`${restUrl(table)}?${filter}`, {
    method: "DELETE",
    headers: headers("service_role"),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase DELETE ${table} failed (${res.status}): ${body}`);
  }
}
