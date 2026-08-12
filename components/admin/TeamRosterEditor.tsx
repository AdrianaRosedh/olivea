"use client";

import { useState } from "react";
import {
  Trash2,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Plus,
  Star,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAdminLocale, type B } from "@/lib/admin/i18n";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useConfirm } from "@/components/admin/ConfirmDialog";

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
  const confirm = useConfirm();
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

  const remove = async (i: number) => {
    const m = members[i];
    const who = m.name || t({ es: "este miembro", en: "this member" });
    const ok = await confirm({
      tone: "danger",
      title: {
        es: `¿Quitar a ${who} del equipo?`,
        en: `Remove ${who} from the team?`,
      },
      body: {
        es: "Desaparecerá de la página pública y su página de perfil dejará de existir en cuanto guardes.",
        en: "They disappear from the public team page, and their profile page stops existing as soon as you save.",
      },
      confirmLabel: { es: "Quitar", en: "Remove" },
    });
    if (!ok) return;
    commit(members.filter((_, idx) => idx !== i));
  };

  const add = () => {
    // Deterministic rather than time-based: Date.now() in the component body
    // is an impure call, and a counted slug reads better anyway.
    let n = members.length + 1;
    while (members.some((m) => m.id === `nuevo-${n}`)) n += 1;
    const id = `nuevo-${n}`;
    commit([
      ...members,
      { id, name: "", role: empty(), bio: empty(), links: [], tile: "md" },
    ]);
    setOpenId(id);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--olivea-clay)]/70">
        {title}
      </h4>
      {children}
    </section>
  );

  const renderFields = (i: number, m: RosterMember) => (
    <div className="space-y-7">
      <Section title={t({ es: "Identidad", en: "Identity" })}>
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
            <div className={S.label}>{t({ es: "ID · su página", en: "ID · their page" })}</div>
            <input
              type="text"
              value={m.id}
              onChange={(e) =>
                update(i, { id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })
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
      </Section>

      <Section title={t({ es: "Biografía", en: "Bio" })}>
        <Bilingual
          label={t({ es: "Texto", en: "Text" })}
          value={m.bio ?? empty()}
          onChange={(v) => update(i, { bio: v })}
          multiline
          rows={7}
        />
      </Section>

      <Section title={t({ es: "Foto", en: "Photo" })}>
        <ImageUpload
          value={m.avatar ?? ""}
          onChange={(url) => update(i, { avatar: url || undefined })}
          folder="team"
          aspectRatio="aspect-square"
          hint={t({
            es: "Recomendado: 800 × 800 px (cuadrada). Se recorta en círculo.",
            en: "Recommended: 800 × 800 px (square). Cropped to a circle.",
          })}
        />
      </Section>

      <Section title={t({ es: "Galería del perfil", en: "Profile gallery" })}>
        <p className="-mt-1 text-[10px] leading-relaxed text-[var(--olivea-clay)]/60">
          {t({
            es: "Las fotos que se muestran en su página de perfil. El orden aquí es el orden en que aparecen.",
            en: "The photos shown on their profile page. The order here is the order they appear in.",
          })}
        </p>
        {(m.gallery ?? []).length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(m.gallery ?? []).map((src, gi) => {
              const gallery = m.gallery ?? [];
              const swap = (j: number) => {
                if (j < 0 || j >= gallery.length) return;
                const next = [...gallery];
                [next[gi], next[j]] = [next[j], next[gi]];
                update(i, { gallery: next });
              };
              return (
                <div
                  key={`${src}-${gi}`}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-[var(--olivea-cream)]/40 ring-1 ring-black/[0.06]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => swap(gi - 1)}
                      disabled={gi === 0}
                      aria-label={t({ es: "Mover antes", en: "Move earlier" })}
                      className="rounded p-0.5 text-white/90 transition-colors hover:text-white disabled:opacity-25"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        update(i, { gallery: gallery.filter((_, x) => x !== gi) })
                      }
                      aria-label={t({ es: "Quitar foto", en: "Remove photo" })}
                      className="rounded p-0.5 text-white/90 transition-colors hover:text-red-300"
                    >
                      <X size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => swap(gi + 1)}
                      disabled={gi === gallery.length - 1}
                      aria-label={t({ es: "Mover después", en: "Move later" })}
                      className="rounded p-0.5 text-white/90 transition-colors hover:text-white disabled:opacity-25"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* value="" so the dropzone always shows: this adds to the gallery
            rather than replacing a single image. */}
        <ImageUpload
          value=""
          onChange={(url) =>
            url && update(i, { gallery: [...(m.gallery ?? []), url] })
          }
          folder="team"
          aspectRatio="aspect-[4/3]"
          hint={t({
            es: "Recomendado: 1200 px de ancho. Se agrega al final de la galería.",
            en: "Recommended: 1200 px wide. Added to the end of the gallery.",
          })}
        />
      </Section>

      <Section title={t({ es: "Dónde aparece", en: "Where they appear" })}>
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
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  on
                    ? "bg-[var(--olivea-olive)]/12 text-[var(--olivea-olive)]"
                    : "bg-white/70 text-[var(--olivea-clay)]/60 hover:bg-white"
                }`}
              >
                {t(CATEGORY_LABEL[c])}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-[11px] text-[var(--olivea-clay)]">
          <input
            type="checkbox"
            checked={!!m.alwaysShow}
            onChange={(e) => update(i, { alwaysShow: e.target.checked })}
          />
          {t({ es: "Mostrar en todos los filtros", en: "Show in every filter" })}
        </label>
        <div className="space-y-1">
          <div className={S.label}>{t({ es: "Tamaño en la cuadrícula", en: "Grid tile" })}</div>
          <div className="flex gap-1.5">
            {(["hero", "md"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => update(i, { tile: size })}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  (m.tile ?? "md") === size
                    ? "bg-[var(--olivea-olive)]/12 text-[var(--olivea-olive)]"
                    : "bg-white/70 text-[var(--olivea-clay)]/60 hover:bg-white"
                }`}
              >
                {size === "hero"
                  ? t({ es: "Destacado", en: "Featured" })
                  : t({ es: "Normal", en: "Normal" })}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title={t({ es: "Enlaces del perfil", en: "Profile links" })}>
        {(m.links ?? []).map((link, li) => (
          <div key={li} className="space-y-1.5 rounded-lg bg-white/50 p-2.5 ring-1 ring-black/[0.04]">
            <div className="grid gap-2 md:grid-cols-2">
              <input
                type="text"
                value={link.label?.es ?? ""}
                onChange={(e) =>
                  update(i, {
                    links: (m.links ?? []).map((l, x) =>
                      x === li ? { ...l, label: { ...empty(), ...l.label, es: e.target.value } } : l
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
                      x === li ? { ...l, label: { ...empty(), ...l.label, en: e.target.value } } : l
                    ),
                  })
                }
                placeholder={t({ es: "Texto (EN)", en: "Label (EN)" })}
                className={S.input}
              />
            </div>
            <div className="flex items-center gap-1.5">
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
                className={`${S.input} flex-1`}
              />
              <button
                type="button"
                onClick={() =>
                  update(i, { links: (m.links ?? []).filter((_, x) => x !== li) })
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
          onClick={() => update(i, { links: [...(m.links ?? []), { href: "", label: empty() }] })}
          className="flex items-center gap-1.5 text-[11px] text-[var(--olivea-olive)] transition-colors hover:text-[var(--olivea-ink)]"
        >
          <Plus size={12} /> {t({ es: "Agregar enlace", en: "Add link" })}
        </button>
      </Section>
    </div>
  );

  const editing = members.findIndex((m) => m.id === openId);
  const active = editing >= 0 ? members[editing] : null;
  useScrollLock(!!active);

  return (
    <div className="space-y-2">
      {members.map((m, i) => (
        <div
          key={`${m.id}-${i}`}
          className="flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2 ring-1 ring-black/[0.06] transition-colors hover:bg-white/85"
        >
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
            onClick={() => setOpenId(m.id)}
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
            <span className="ml-auto hidden shrink-0 font-mono text-[10px] text-[var(--olivea-clay)]/45 sm:block">
              /{m.id}
            </span>
          </button>

          {/* Reorder only. Delete lives in the panel, away from the arrows —
              it sat between them before, one slip from removing someone. */}
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label={t({ es: "Subir", en: "Move up" })}
              className="rounded p-1 text-[var(--olivea-clay)]/40 transition-colors hover:text-[var(--olivea-ink)] disabled:opacity-20"
            >
              <ArrowUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === members.length - 1}
              aria-label={t({ es: "Bajar", en: "Move down" })}
              className="rounded p-1 text-[var(--olivea-clay)]/40 transition-colors hover:text-[var(--olivea-ink)] disabled:opacity-20"
            >
              <ArrowDown size={13} />
            </button>
            <button
              type="button"
              onClick={() => setOpenId(m.id)}
              className="ml-1 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--olivea-olive)] transition-colors hover:bg-[var(--olivea-cream)]/70"
            >
              <Pencil size={11} /> {t({ es: "Editar", en: "Edit" })}
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--olivea-olive)] transition-colors hover:bg-[var(--olivea-cream)]/60"
      >
        <UserPlus size={13} /> {t({ es: "Agregar miembro", en: "Add member" })}
      </button>

      {/* Slide-over. The form is far too tall to inline: it pushed the list
          down by ~1700px, so you scrolled past everyone to reach it and lost
          the ordering context the list exists to give you. */}
      {active && (
        <div className="fixed inset-0 z-50 flex justify-end" data-lenis-prevent>
          <button
            type="button"
            aria-label={t({ es: "Cerrar", en: "Close" })}
            onClick={() => setOpenId(null)}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />
          <aside
            className="relative flex h-full w-full flex-col bg-[#f7f8f4] shadow-2xl sm:max-w-[min(860px,62vw)]"
            onKeyDown={(e) => e.key === "Escape" && setOpenId(null)}
          >
            <header className="flex shrink-0 items-center gap-3 border-b border-black/[0.06] px-5 py-3">
              {active.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-black/5" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[var(--olivea-cream)]/60 ring-1 ring-black/5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[var(--olivea-ink)]">
                  {active.name || t({ es: "Nuevo miembro", en: "New member" })}
                </div>
                <div className="truncate font-mono text-[10px] text-[var(--olivea-clay)]/60">
                  /team/{active.id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-full p-2 text-[var(--olivea-clay)] transition-colors hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {renderFields(editing, active)}
            </div>

            <footer className="flex shrink-0 items-center justify-between border-t border-black/[0.06] px-5 py-3">
              <button
                type="button"
                onClick={async () => {
                  await remove(editing);
                  setOpenId(null);
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--olivea-clay)] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={12} /> {t({ es: "Quitar del equipo", en: "Remove from team" })}
              </button>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-lg bg-[var(--olivea-olive)] px-4 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
              >
                {t({ es: "Listo", en: "Done" })}
              </button>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}
