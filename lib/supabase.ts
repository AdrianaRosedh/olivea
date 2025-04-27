// File: lib/supabase.ts
import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

// Server-side Supabase client (with caching)
export const createServerSupabaseClient = cache(() => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
})

// Client-side Supabase client (singleton pattern)
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export function createClientSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("Client Supabase client cannot be used on the server")
  }

  if (!clientSupabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    clientSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return clientSupabaseInstance
}

// Legacy client for backward compatibility
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
