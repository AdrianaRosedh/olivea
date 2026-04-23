// app/(admin-auth)/admin/auth/callback/route.ts
// ─────────────────────────────────────────────────────────────────────
// Auth callback handler for magic link / email OTP login.
// Supports two flows:
//   1. token_hash + type — verifies the OTP token directly (preferred,
//      bypasses Supabase redirect URL allowlist)
//   2. code — exchanges an auth code for a session (PKCE fallback)
// ─────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const rawRedirect = searchParams.get("redirect") ?? "/admin";
  // Prevent open redirect: must start with /admin, no protocol, no double slashes
  const redirect =
    rawRedirect.startsWith("/admin") && !/^\/\/|:\/\//.test(rawRedirect)
      ? rawRedirect
      : "/admin";

  const response = NextResponse.redirect(`${origin}${redirect}`);

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
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let authError = true;

  // Flow 1: Direct token verification (magic link sent via Resend)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (type === "magiclink" || type === "email" ? type : "magiclink") as "magiclink" | "email",
    });
    if (!error) authError = false;
  }

  // Flow 2: PKCE code exchange (fallback)
  if (authError && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) authError = false;
  }

  if (!authError) {
    return response;
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}
