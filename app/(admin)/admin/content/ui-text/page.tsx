"use client";

// Interface text: the short pieces of text around the pages — house names,
// the reservation window, OpenTable's card, the chat buttons, the cookie
// notice, each house's Instagram and Spotify. One record (public.ui_text), one
// key per piece; the keys and their fallback wording are lib/uiText/registry.ts,
// so a new piece of text appears here as soon as it is added there.

import { Type } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import { useAdminLocale } from "@/lib/admin/i18n";
import {
  UI_TEXT,
  UI_TEXT_GROUPS,
  uiTextSeed,
  type UiTextGroup,
  type UiTextKey,
  type UiTextValues,
} from "@/lib/uiText/registry";
import { VisualPageEditor, useEditor, PLAIN_INPUT } from "@/components/admin/visual-editor";

const KEYS = Object.keys(UI_TEXT) as UiTextKey[];
const GROUPS = Object.keys(UI_TEXT_GROUPS) as UiTextGroup[];

/** Long wording gets a box with room for two lines. */
const isLong = (key: UiTextKey) => UI_TEXT[key].en.length > 60;

function UiTextVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();
  const text = (get("text") ?? {}) as UiTextValues;
  // Keys contain dots, so the whole record is written back at once rather
  // than through a dotted path.
  const value = (key: UiTextKey) => text[key] ?? { es: UI_TEXT[key].es, en: UI_TEXT[key].en };
  const put = (key: UiTextKey, v: { es: string; en: string }) => set("text", { ...text, [key]: v });

  const input = (key: UiTextKey, lang: "es" | "en", aria: string) => {
    const v = value(key);
    const onChange = (s: string) =>
      put(key, UI_TEXT[key].plain ? { es: s, en: s } : { ...v, [lang]: s });
    return isLong(key) ? (
      <textarea className={PLAIN_INPUT} rows={2} aria-label={aria} value={v[lang]} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input className={PLAIN_INPUT} aria-label={aria} value={v[lang]} onChange={(e) => onChange(e.target.value)} />
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-600 leading-relaxed">
        {t({
          es: "El texto alrededor de las páginas: nombres de las casas, la ventana de reservación, el chat, el aviso de cookies y las redes de cada casa. El horario del chat está en Horarios.",
          en: "The text around the pages: house names, the reservation window, the chat, the cookie notice and each house's socials. The chat's hours are in Operating Hours.",
        })}
      </p>

      {GROUPS.map((group) => (
        <section key={group} className="rounded-2xl border border-stone-200/80 bg-white/60 p-4 md:p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-600">{t(UI_TEXT_GROUPS[group])}</h2>
          {KEYS.filter((k) => UI_TEXT[k].group === group).map((key) => {
            const label = t(UI_TEXT[key].label);
            return (
              <div key={key} className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</div>
                {UI_TEXT[key].plain ? (
                  input(key, "es", label)
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-2 w-6 shrink-0 text-[11px] font-semibold text-stone-400">ES</span>
                      {input(key, "es", `${label} (ES)`)}
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-2 w-6 shrink-0 text-[11px] font-semibold text-stone-400">EN</span>
                      {input(key, "en", `${label} (EN)`)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

export default function UiTextAdmin() {
  return (
    <SectionGuard sectionKey="settings.uitext">
      <VisualPageEditor
        title="Interface text"
        table="ui_text"
        icon={<Type className="w-5 h-5 text-[var(--olivea-olive)]" />}
        fallbackData={{ text: uiTextSeed() }}
      >
        <UiTextVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
