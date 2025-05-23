// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

// 1️⃣ Browser‐only keys (must exist)
const PUBLIC_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const PUBLIC_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
if (!PUBLIC_URL || !PUBLIC_ANON) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// 2️⃣ Server keys: prefer service role, otherwise fall back to anon
const SERVER_URL = process.env.SUPABASE_URL ?? PUBLIC_URL
const SERVER_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? PUBLIC_ANON

// 3️⃣ Server‐side client (uses service role if present)
export const createServerSupabaseClient = cache(() => {
  return createClient(SERVER_URL, SERVER_KEY)
})

// 4️⃣ Browser helper if you ever need one
export function createClientSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("createClientSupabaseClient() can only be used in a browser")
  }
  return createClient(PUBLIC_URL, PUBLIC_ANON)
}