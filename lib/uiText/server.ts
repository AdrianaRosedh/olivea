// lib/uiText/server.ts
// Loads the admin's interface text (public.ui_text) on the server. Missing
// keys fall back to the registry's copy where they are shown (see uiText()).

import type { UiTextValues } from "./registry";

export async function loadUiText(): Promise<UiTextValues> {
  try {
    const { isSupabaseConfigured } = await import("@/lib/supabase/config");
    if (!isSupabaseConfigured) return {};
    const { selectRows } = await import("@/lib/supabase/client");
    const rows = await selectRows<{ text: UiTextValues | null }>("ui_text", {
      role: "anon",
      query: "select=text&limit=1",
      revalidate: 60,
    });
    return rows[0]?.text ?? {};
  } catch {
    return {};
  }
}
