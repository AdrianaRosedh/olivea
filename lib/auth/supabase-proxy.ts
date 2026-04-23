// lib/auth/supabase-proxy.ts
// ─────────────────────────────────────────────────────────────────────
// Shared Supabase session refresh logic for the Next.js proxy.
// Refreshes expired auth tokens and writes updated cookies.
// ─────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Refresh the Supabase auth session and return an updated response.
 * Returns { user, response } — the user is null if unauthenticated.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]
      ) {
        // Write cookies to the request (for downstream server components)
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        // Create a new response that carries the updated request headers
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        // Write cookies to the response (for the browser)
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh the session — getUser validates the JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response };
}
