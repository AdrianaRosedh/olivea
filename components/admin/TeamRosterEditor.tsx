"use client";

import { useState } from "react";
import {
  ChevronDown,
  GripVertical,
  Trash2,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Plus,
  Star,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAdminLocale, type B } from "@/lib/admin/i18n";

type I18nText = { es: string; en: string };
type TeamLink = { href: string; label: I18nText; highlight?: boolean };
type FilterCategory = "hotel" | "restaurant" | "cafe";

export type RosterMember = {
  id: string;
  name: string;
  role: I18nText;
  org?: I18nText;
  tag?: I18nText;
  bio?: I18nText;
  avatar?: string;
  gallery?: string[];
  priority?: number;
  tile?: "hero" | "md";
  showIn?: FilterCategory[];
  alwaysShow?: boolean;
  links: TeamLink[];
};

const CATEGORIES: FilterCategory[] = ["hotel", "restaurant", "cafe"];
const CATEGORY_LABEL: Record<FilterCategory, B> = {
  hotel: { es: "Hotel", en: "Hotel" },
  restaurant: { es: "Restaurante", en: "Restaurant" },
  cafe: { es: "Café", en: "Café" },
};

const empty = (): I18nText => ({ es: "", en: "" });

const S = {
  input:
    "w-full px-3 py-2 rounded-lg bg-white/70 border border-[var(--olivea-olive)]/[0.10] text-sm text-[var(--olivea-ink)] placeholder:text-[var(--olivea-clay)]/40 focus:outline-none focus:border-[var(--olivea-olive)]/25 transition-colors",
  area:
    "w-full px-3 py-2 rounded-lg bg-white/70 border border-[var(--olivea-olive)]/[0.10] text-sm text-[var(--olivea-ink)] placeholder:text-[var(--olivea-clay)]/40 focus:outline-none focus:border-[var(--olivea-olive)]/25 transition-colors resize-y leading-relaxed",
  label:
    "text-[10px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]",
};

/** Bilingual field: the site renders both languages, so both are always shown. */
function Bilingual({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
}: {
  label: string;
  value: I18nText;
  onChange: (v: I18nText) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="space-y-1">
      <div className={S.label}>{label}</div>
      <div className="grid gap-2 md:grid-cols-2">
        {(["es", "en"] as const).map((lang) => (
          <div key={lang}>
            <div className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/50">
              {lang}
            </div>
            <Field
              value={value?.[lang] ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
                onChange({ ...empty(), ...value, [lang]: e.target.value })
              }
              {...(multiline ? { rows } : { type: "text" })}
              className={multiline ? S.area : S.input}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamRosterEditor({
  value,
  onChange,
}: {
  value: RosterMember[];
  onChange: (v: RosterMember[]) => void;
}) {
  const { t } = useAdminLocale();
  const [openId, setOpenId] = useState<string | null>(null);
  const members = Array.isArray(value) ? value : [];

  /** Reordering rewrites priority so grid order and the stored value can't
   *  drift apart — getSortedTeam() sorts by priority, not array position. */
  const commit = (next: RosterMember[]) =>
    onChange(next.map((m, i) => ({ ...m, priority: i + 1 })));

  const update = (i: number, patch: Partial<RosterMember>) =>
    commit(members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= members.length) return;
    const next = [...members];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const remove = (i: number) => {
    const m = members[i];
    const ok = window.confirm(
      t({
        es: `¿Quitar a ${m.name || "este miembro"} del equipo? Desaparecerá de la página pública y su perfil dejará de existir al guardar.`,
        en: `Remove ${m.name || "this member"} from the team? They disappear from the public page and their profile page stops existing once you save.`,
      })
    );
    if (!ok) return;
    commit(members.filter((_, idx) => idx !== i));
  };

  const add = () => {
    const id = `nuevo-${Date.now().toString(36).slice(-4)}`;
    commit([
      ...members,
      { id, name: "", role: empty(), bio: empty(), links: [], tile: "md" },
    ]);
    setOpenId(id);
  };

  return (
    <div className="space-y-2">
      {members.map((m, i) => {
        const open = openId === m.id;
        return (
          <div
            key={`${m.id}-${i}`}
            className="overflow-hidden rounded-xl bg-white/60 ring-1 ring-black/[0.06]"
          >
            {/* Collapsed row */}
            <div className="flex items-center gap-2 px-3 py-2">
              <GripVertical size={14} className="shrink-0 text-[var(--olivea-clay)]/25" />
              {m.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.avatar}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-black/5"
                />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--olivea-cream)]/60 ring-1 ring-black/5" />
              )}

              <button
                type="button"
                onClick={() => setOpenId(open ? null : m.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span className="truncate text-sm font-medium text-[var(--olivea-ink)]">
                  {m.name || t({ es: "(sin nombre)", en: "(unnamed)" })}
                </span>
                <span className="truncate text-[11px] text-[var(--olivea-clay)]/70">
                  {m.role?.es || m.role?.en}
                </span>
                {m.alwaysShow && (
                  <Star size={11} className="shrink-0 text-[var(--olivea-olive)]/60" />
                )}
                <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--olivea-clay)]/45">
                  /{m.id}
                </span>
              </button>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded p-1 text-[var(--olivea-clay)]/40 transition-colors hover:text-[var(--olivea-ink)] disabled:opacity-25"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === members.length - 1}
                  className="rounded p-1 text-[var(--olivea-clay)]/40 transition-colors hover:text-[var(--olivea-ink)] disabled:opacity-25"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded p-1 text-[var(--olivea-clay)]/40 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : m.id)}
                  className="rounded p-1 text-[var(--olivea-clay)]/40 transition-colors hover:text-[var(--olivea-ink)]"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded editor */}
            {open && (
              <div className="space-y-4 border-t border-black/[0.04] px-4 py-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className={S.label}>{t({ es: "Nombre", en: "Name" })}</div>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => update(i, { name: e.target.value })}
                      className={S.input}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className={S.label}>
                      {t({ es: "ID · su página", en: "ID · their page" })}
                    </div>
                    <input
                      type="text"
                      value={m.id}
                      onChange={(e) =>
                        update(i, {
                          id: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      className={`${S.input} font-mono text-xs`}
                    />
                    <p className="text-[10px] text-[var(--olivea-clay)]/55">
                      oliveafarmtotable.com/team/{m.id || "…"}
                    </p>
                  </div>
                </div>

                <Bilingual
                  label={t({ es: "Puesto", en: "Role" })}
                  value={m.role ?? empty()}
                  onChange={(v) => update(i, { role: v })}
                />
                <Bilingual
                  label={t({ es: "Organización", en: "Organisation" })}
                  value={m.org ?? empty()}
                  onChange={(v) => update(i, { org: v })}
                />
                <Bilingual
                  label={t({ es: "Etiqueta", en: "Tag" })}
                  value={m.tag ?? empty()}
                  onChange={(v) => update(i, { tag: v })}
                />
                <Bilingual
                  label={t({ es: "Biografía", en: "Bio" })}
                  value={m.bio ?? empty()}
                  onChange={(v) => update(i, { bio: v })}
                  multiline
                  rows={6}
                />

                <div className="space-y-1">
                  <div className={S.label}>{t({ es: "Foto", en: "Photo" })}</div>
                  <ImageUpload
                    value={m.avatar ?? ""}
                    onChange={(url) => update(i, { avatar: url || undefined })}
                    folder="team"
                    aspectRatio="aspect-square"
                    hint={t({
                      es: "Recomendado: 800 × 800 px (cuadrada). Se recorta en círculo en la lista.",
                      en: "Recommended: 800 × 800 px (square). Cropped to a circle in the list.",
                    })}
                  />
                </div>

                {/* Visibility */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className={S.label}>
                      {t({ es: "Aparece en", en: "Appears in" })}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((c) => {
                        const on = (m.showIn ?? []).includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              update(i, {
                                showIn: on
                                  ? (m.showIn ?? []).filter((x) => x !== c)
                                  : [...(m.showIn ?? []), c],
                              })
                            }
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              on
                                ? "bg-[var(--olivea-olive)]/12 text-[var(--olivea-olive)]"
                                : "bg-white/60 text-[var(--olivea-clay)]/60 hover:bg-white"
                            }`}
                          >
                            {t(CATEGORY_LABEL[c])}
                          </button>
                        );
                      })}
                    </div>
                    <label className="flex items-center gap-2 pt-1 text-[11px] text-[var(--olivea-clay)]">
                      <input
                        type="checkbox"
                        checked={!!m.alwaysShow}
                        onChange={(e) => update(i, { alwaysShow: e.target.checked })}
                      />
                      {t({
                        es: "Mostrar en todos los filtros",
                        en: "Show in every filter",
                      })}
                    </label>
                  </div>

                  <div className="space-y-1">
                    <div className={S.label}>
                      {t({ es: "Tamaño en la cuadrícula", en: "Grid tile" })}
                    </div>
                    <div className="flex gap-1.5">
                      {(["hero", "md"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => update(i, { tile: size })}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            (m.tile ?? "md") === size
                              ? "bg-[var(--olivea-olive)]/12 text-[var(--olivea-olive)]"
                              : "bg-white/60 text-[var(--olivea-clay)]/60 hover:bg-white"
                          }`}
                        >
                          {size === "hero"
                            ? t({ es: "Destacado", en: "Featured" })
                            : t({ es: "Normal", en: "Normal" })}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-1.5">
                  <div className={S.label}>
                    {t({ es: "Enlaces del perfil", en: "Profile links" })}
                  </div>
                  {(m.links ?? []).map((link, li) => (
                    <div key={li} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                      <input
                        type="text"
                        value={link.label?.es ?? ""}
                        onChange={(e) =>
                          update(i, {
                            links: (m.links ?? []).map((l, x) =>
                              x === li
                                ? { ...l, label: { ...empty(), ...l.label, es: e.target.value } }
                                : l
                            ),
                          })
                        }
                        placeholder={t({ es: "Texto (ES)", en: "Label (ES)" })}
                        className={S.input}
                      />
                      <input
                        type="text"
                        value={link.label?.en ?? ""}
                        onChange={(e) =>
                          update(i, {
                            links: (m.links ?? []).map((l, x) =>
                              x === li
                                ? { ...l, label: { ...empty(), ...l.label, en: e.target.value } }
                                : l
                            ),
                          })
                        }
                        placeholder={t({ es: "Texto (EN)", en: "Label (EN)" })}
                        className={S.input}
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) =>
                            update(i, {
                              links: (m.links ?? []).map((l, x) =>
                                x === li ? { ...l, href: e.target.value } : l
                              ),
                            })
                          }
                          placeholder="https://…"
                          className={`${S.input} min-w-40`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            update(i, {
                              links: (m.links ?? []).filter((_, x) => x !== li),
                            })
                          }
                          className="rounded p-1.5 text-[var(--olivea-clay)]/40 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update(i, {
                        links: [...(m.links ?? []), { href: "", label: empty() }],
                      })
                    }
                    className="flex items-center gap-1.5 text-[11px] text-[var(--olivea-olive)] transition-colors hover:text-[var(--olivea-ink)]"
                  >
                    <Plus size={12} /> {t({ es: "Agregar enlace", en: "Add link" })}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--olivea-olive)] transition-colors hover:bg-[var(--olivea-cream)]/60"
      >
        <UserPlus size={13} /> {t({ es: "Agregar miembro", en: "Add member" })}
      </button>
    </div>
  );
}
