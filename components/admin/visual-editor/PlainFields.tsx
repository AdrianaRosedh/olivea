"use client";

// Plain (single-language) fields for the visual editors: a labelled field, a
// list of short strings. Used where the text is in one language on purpose —
// what Google and AI assistants read (the Google listing cards, AI Summary).

import type { ReactNode } from "react";
import EditableListShell from "./EditableListShell";
import { useAdminLocale, type MaybeB } from "@/lib/admin/i18n";

export const INPUT =
  "w-full rounded-xl bg-white/80 ring-1 ring-black/10 px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]/40";

export function Field({ label, hint, children }: { label: MaybeB; hint?: MaybeB; children: ReactNode }) {
  const { t } = useAdminLocale();
  const text = (v?: MaybeB) => (v === undefined ? "" : typeof v === "string" ? v : t(v));
  return (
    <label className="block space-y-1">
      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{text(label)}</span>
      {children}
      {hint && <span className="block text-[11px] text-stone-400">{text(hint)}</span>}
    </label>
  );
}

export function StringList({ label, value, onChange, addLabel }: {
  label: MaybeB;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
  addLabel: MaybeB;
}) {
  return (
    <EditableListShell<string>
      label={label}
      items={value ?? []}
      onChange={onChange}
      makeItem={() => ""}
      addLabel={addLabel}
      renderItem={(item, update) => (
        <input className={INPUT} value={item} onChange={(e) => update(e.target.value)} />
      )}
    />
  );
}
