// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

// 1️⃣ Grab your public (browser) keys and crash early if they’re missing:
const PUBLIC_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const PUBLIC_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!PUBLIC_URL || !PUBLIC_ANON) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env"
  )
}

// Now we know these are string, so we `!` them at the call site:
export const supabase = createClient(PUBLIC_URL!, PUBLIC_ANON!)

// 2️⃣ Build your server‐side client (use service role if set, otherwise fall back to anon)
const SERVER_URL = process.env.SUPABASE_URL     ?? PUBLIC_URL
const SERVER_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? PUBLIC_ANON

if (!SERVER_URL || !SERVER_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (and no anon fallback)"
  )
}

export const createServerSupabaseClient = cache(() => {
  // Non-null assertion here too:
  return createClient(SERVER_URL!, SERVER_KEY!)
})

// 3️⃣ If you ever need a standalone browser‐only client:
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null
export function createClientSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("createClientSupabaseClient() can only be used in a browser")
  }
  if (!clientSupabaseInstance) {
    clientSupabaseInstance = createClient(PUBLIC_URL!, PUBLIC_ANON!)
  }
  return clientSupabaseInstance
}