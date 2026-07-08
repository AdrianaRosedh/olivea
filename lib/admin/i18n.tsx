"use client";

// ─────────────────────────────────────────────────────────────────────
// Admin portal i18n — Mexican Spanish (default) + English, per user.
//
// The preferred language lives on admin_users.locale (set from the
// profile panel); the server layout passes it as initialLocale. Every
// admin string is an { es, en } pair resolved through t().
// ─────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { AdminLocale } from "@/lib/auth/types";

export type { AdminLocale };

/** A bilingual admin-UI string */
export interface B {
  es: string;
  en: string;
}

/** A label that may be a plain string (legacy) or a bilingual pair. */
export type MaybeB = string | B;

/** Resolve a string-or-bilingual label without a hook (pass the locale). */
export function resolveLabel(label: MaybeB | undefined, locale: AdminLocale): string {
  if (label == null) return "";
  return typeof label === "string" ? label : locale === "en" ? label.en : label.es;
}

/* ── Context ──────────────────────────────────────────────────────── */

interface AdminLocaleContextValue {
  locale: AdminLocale;
  /** Switch language — optimistic, then persisted to the user's profile */
  setLocale: (l: AdminLocale) => void;
  /** Resolve a bilingual string for the current language */
  t: (b: B) => string;
}

const AdminLocaleContext = createContext<AdminLocaleContextValue>({
  locale: "es",
  setLocale: () => {},
  t: (b) => b.es,
});

export function AdminLocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale?: AdminLocale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<AdminLocale>(initialLocale ?? "es");

  const setLocale = useCallback((l: AdminLocale) => {
    setLocaleState(l); // optimistic — the UI flips immediately
    // Persist to the user's profile; harmless no-op when it fails (dev/mock)
    import("@/lib/auth/actions")
      .then(({ updateProfile }) => updateProfile({ locale: l }))
      .catch(() => {});
  }, []);

  const t = useCallback((b: B) => (locale === "en" ? b.en : b.es), [locale]);

  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale(): AdminLocaleContextValue {
  return useContext(AdminLocaleContext);
}

/* ── Shared chrome strings ────────────────────────────────────────────
   Common verbs/labels used across the whole portal. Page-specific
   strings live next to their pages as { es, en } literals. */

export const STR = {
  // Actions
  save: { es: "Guardar", en: "Save" },
  saving: { es: "Guardando…", en: "Saving…" },
  saveChanges: { es: "Guardar cambios", en: "Save Changes" },
  discard: { es: "Descartar", en: "Discard" },
  reload: { es: "Recargar", en: "Reload" },
  reloadFromServer: { es: "Recargar del servidor", en: "Reload from server" },
  cancel: { es: "Cancelar", en: "Cancel" },
  delete: { es: "Eliminar", en: "Delete" },
  edit: { es: "Editar", en: "Edit" },
  add: { es: "Agregar", en: "Add" },
  remove: { es: "Quitar", en: "Remove" },
  moveUp: { es: "Subir", en: "Move up" },
  moveDown: { es: "Bajar", en: "Move down" },
  search: { es: "Buscar", en: "Search" },
  signOut: { es: "Cerrar sesión", en: "Sign out" },
  loading: { es: "Cargando…", en: "Loading…" },

  // Editor status
  viewLivePage: { es: "Ver página en vivo", en: "View live page" },
  viewLive: { es: "Ver en vivo", en: "View live" },
  unsavedChanges: {
    es: "Cambios sin guardar — haz clic en Guardar para publicar",
    en: "Unsaved changes — click Save to publish",
  },
  liveWithin60s: {
    es: "Los cambios aparecen en el sitio público en menos de un minuto",
    en: "Edits go live on the public site within 60 seconds of saving",
  },
  readOnlyEditor: {
    es: "Solo lectura — necesitas acceso de Editor para hacer cambios",
    en: "Read-only — you need Editor access to make changes",
  },
  savedOk: { es: "Cambios guardados correctamente", en: "Changes saved successfully" },
  savedLiveSoon: { es: "Guardado — en vivo en menos de un minuto", en: "Changes saved — live within a minute" },
  saveFailed: {
    es: "No se pudo guardar — inténtalo de nuevo",
    en: "Save failed — try again",
  },

  // Site impact (how an edit connects to the website)
  affects: { es: "Afecta a", en: "Affects" },
  affectsWholeSite: { es: "Afecta a todo el sitio", en: "Affects the whole site" },

  // Dock / nav
  today: { es: "Hoy", en: "Today" },
  dailyUpdates: { es: "Actualizaciones", en: "Daily Updates" },
  brandPages: { es: "Marca y Páginas", en: "Brand & Pages" },
  setup: { es: "Configuración", en: "Setup" },
  team: { es: "Equipo", en: "Team" },

  // Profile
  language: { es: "Idioma", en: "Language" },
  languageHint: {
    es: "El idioma del panel de administración (solo para ti)",
    en: "The admin portal language (just for you)",
  },
  spanishMx: { es: "Español (México)", en: "Español (México)" },
  english: { es: "English", en: "English" },
} as const;
