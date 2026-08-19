"use client";

// components/careers/OpeningsBoard.tsx
// ─────────────────────────────────────────────────────────────────────
// The public list of live job openings, and the detail view each one opens
// into.
//
// What HR writes in the careers editor is a full posting: a description plus a
// line-per-item requirements list, in both languages. The previous card showed
// a two-line clamp of the description and dropped the requirements entirely,
// so the substance of every posting was invisible on the site and the card
// just jumped to the application form.
//
// Every live role now renders as a card, opens into a modal with the complete
// posting, and is addressable as ?vacante=<slug> — which is what lets the
// "we're hiring" pill link straight to a role and have it open on arrival.
//
// Openings arrive as props from the server page, so the list is in the HTML
// for crawlers and there is no loading flash.
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock3, Layers, MapPin, X } from "lucide-react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { findOpeningByToken, openingSlug, parseRequirements } from "@/lib/careers/slug";
import type { Lang } from "@/lib/i18n";

/** Mirrors JobOpening from careers-actions without importing across the
 *  "use server" boundary for a value. */
export type PublicOpening = {
  id: string;
  titleEs: string;
  titleEn: string;
  area: string;
  type: string;
  descriptionEs: string;
  descriptionEn: string;
  requirementsEs: string;
  requirementsEn: string;
  location: string;
  publishedAt: string | null;
};

const TYPE_LABEL: Record<string, { es: string; en: string }> = {
  "full-time": { es: "Tiempo completo", en: "Full-time" },
  "part-time": { es: "Medio tiempo", en: "Part-time" },
  seasonal: { es: "Temporal", en: "Seasonal" },
  internship: { es: "Prácticas", en: "Internship" },
};

function typeLabel(type: string, lang: Lang): string {
  // Unknown values can only come from a future editor option — show them
  // readably rather than blanking the chip.
  return TYPE_LABEL[type]?.[lang] ?? type.replace(/-/g, " ");
}

/** Per-language view of an opening, with Spanish as the fallback throughout —
 *  HR always fills Spanish first, so an unfinished translation degrades to a
 *  readable posting rather than a blank card. */
function view(o: PublicOpening, lang: Lang) {
  const isEs = lang === "es";
  return {
    title: (isEs ? o.titleEs : o.titleEn) || o.titleEs || o.titleEn,
    description: (isEs ? o.descriptionEs : o.descriptionEn) || o.descriptionEs,
    requirements: parseRequirements(
      (isEs ? o.requirementsEs : o.requirementsEn) || o.requirementsEs
    ),
  };
}

const COPY = {
  es: {
    section: "Posiciones abiertas",
    lead: "Vacantes publicadas por nuestro equipo de Recursos Humanos.",
    one: "1 vacante abierta",
    many: (n: number) => `${n} vacantes abiertas`,
    view: "Ver vacante",
    about: "Sobre el puesto",
    requirements: "Requisitos",
    apply: "Aplicar a esta vacante",
    close: "Cerrar",
    posted: "Publicada",
  },
  en: {
    section: "Open positions",
    lead: "Roles published by our Human Resources team.",
    one: "1 open role",
    many: (n: number) => `${n} open roles`,
    view: "View role",
    about: "About the role",
    requirements: "Requirements",
    apply: "Apply for this role",
    close: "Close",
    posted: "Posted",
  },
} as const;

function formatPosted(iso: string | null, lang: Lang): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Meta chip ───────────────────────────────────────────────────────

function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-[11.5px] text-(--olivea-ink)/70 ring-1 ring-black/6">
      <Icon className="h-3.5 w-3.5 shrink-0 text-(--olivea-olive)/75" aria-hidden />
      <span className="truncate">{children}</span>
    </span>
  );
}

// ── Board ───────────────────────────────────────────────────────────

export default function OpeningsBoard({
  openings,
  lang,
}: {
  openings: PublicOpening[];
  lang: Lang;
}) {
  const c = COPY[lang];
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const active = useMemo(
    () => openings.find((o) => o.id === activeId) ?? null,
    [openings, activeId]
  );

  // Deep link → open on arrival.
  //
  // Read from the URL after mount rather than from server searchParams: the
  // careers page is statically rendered with ISR, and awaiting searchParams on
  // the server would opt every visit into dynamic rendering just to support a
  // link. The modal animates in anyway, so the one-frame delay is invisible.
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("vacante");
    const match = findOpeningByToken(openings, token);
    if (match) setActiveId(match.id);
  }, [openings]);

  // Keep the URL shareable while a role is open. replaceState (not push) so
  // Back still leaves the page rather than stepping through modal states.
  const syncUrl = useCallback((slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("vacante", slug);
    else url.searchParams.delete("vacante");
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const open = useCallback(
    (o: PublicOpening, trigger?: HTMLElement | null) => {
      lastTrigger.current = trigger ?? null;
      setActiveId(o.id);
      syncUrl(openingSlug(o, lang));
    },
    [syncUrl, lang]
  );

  const close = useCallback(() => {
    setActiveId(null);
    syncUrl(null);
    // Return focus to the card that opened it.
    lastTrigger.current?.focus?.();
  }, [syncUrl]);

  if (openings.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[13px] uppercase tracking-[0.22em] text-(--olivea-olive)/85">
          {c.section}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-(--olivea-ink)/55">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--olivea-olive)/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--olivea-olive)" />
          </span>
          {openings.length === 1 ? c.one : c.many(openings.length)}
        </span>
      </div>

      {/* Column count follows the number of roles: a lone posting in a
          three-track grid reads as a stray tile rather than a listing. */}
      <div
        className={[
          "grid gap-4",
          openings.length === 1
            ? "max-w-2xl"
            : openings.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-2 xl:grid-cols-3",
        ].join(" ")}
      >
        {openings.map((o) => {
          const v = view(o, lang);
          return (
            <a
              key={o.id}
              href={`?vacante=${openingSlug(o, lang)}`}
              onClick={(e) => {
                // Let modified clicks open a real tab.
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                open(o, e.currentTarget);
              }}
              /* p-4 on phones: the page already spends 50px per side on its
                 own gutters, so a 20px card inset left the meta chips 235px
                 and they stacked one per line — three rows for three chips. */
              className="group flex flex-col rounded-[22px] bg-white/45 p-4 text-left ring-1 ring-black/8 sm:p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/65 hover:shadow-[0_26px_60px_-40px_rgba(0,0,0,0.5)] hover:ring-black/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/45"
            >
              <h4 className="text-[17px] leading-snug font-semibold text-(--olivea-ink) transition-colors group-hover:text-(--olivea-olive)">
                {v.title}
              </h4>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Meta icon={Layers}>{o.area}</Meta>
                <Meta icon={Clock3}>{typeLabel(o.type, lang)}</Meta>
                <Meta icon={MapPin}>{o.location}</Meta>
              </div>

              {v.description && (
                <p className="mt-3.5 line-clamp-3 text-[14px] leading-[1.75] text-(--olivea-ink)/70">
                  {v.description}
                </p>
              )}

              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-(--olivea-olive)">
                {c.view}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </a>
          );
        })}
      </div>

      <OpeningDialog opening={active} lang={lang} onClose={close} />
    </div>
  );
}

// ── Detail dialog ───────────────────────────────────────────────────

function OpeningDialog({
  opening,
  lang,
  onClose,
}: {
  opening: PublicOpening | null;
  lang: Lang;
  onClose: () => void;
}) {
  const c = COPY[lang];
  const panelRef = useRef<HTMLDivElement>(null);

  // Rendered into document.body rather than in place.
  //
  // SubtleContentFade wraps the page in a motion.div with willChange:"opacity"
  // (SubtleContentFade.tsx:244), which creates a stacking context — so z-1400
  // only ranked the dialog *within* that wrapper. The navbar sits in its own
  // root-level <nav class="fixed z-50">, and a root-level 50 beats the whole
  // wrapped subtree however high the number inside it goes. On a short
  // landscape tablet, where the dialog is tall enough to reach the top of the
  // viewport, the navbar drew straight over the dialog's header.
  //
  // z-index cannot escape a stacking context, so raising it again would not
  // have helped. A portal puts the dialog in the root context where z-1400
  // means what it says. Same approach farmpop and the team panel already use.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useScrollLock(!!opening);

  useEffect(() => {
    if (!opening) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the dialog so Escape and Tab land here, not on the page.
    const id = window.setTimeout(() => panelRef.current?.focus(), 40);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
  }, [opening, onClose]);

  const applyToRole = () => {
    if (!opening) return;
    const title = (lang === "es" ? opening.titleEs : opening.titleEn) || opening.titleEs;
    onClose();
    // The form owns its own fields; tell it which role to prefill. Same
    // window-event convention the footer uses for the cookie panel.
    window.dispatchEvent(
      new CustomEvent("olivea:apply-for-role", {
        detail: { openingId: opening.id, roleTitle: title, area: opening.area },
      })
    );
    window.setTimeout(() => {
      document
        .getElementById("aplicar")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const v = opening ? view(opening, lang) : null;
  const posted = opening ? formatPosted(opening.publishedAt, lang) : null;

  const dialog = (
    <AnimatePresence>
      {opening && v && (
        /* The container must be the motion component, not a plain div:
           AnimatePresence only tracks exit on motion children, and with a
           plain wrapper it never learns the exit finished — leaving this
           full-screen overlay mounted over the page, swallowing every click. */
        <motion.div
          key="opening-dialog"
          /* z-1400 is this site's modal layer (ReservationModal uses it), and
             it has to clear the z-1000 navbar — at z-300 the mobile header
             painted straight over the top of the dialog. */
          className="fixed inset-0 z-1400 flex items-center justify-center p-4 sm:p-6"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label={c.close}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[#2d3b29]/30 backdrop-blur-[3px]"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={v.title}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            /* min-h-0 is what lets the body scroll instead of the page:
               without it the flex child refuses to shrink below its content. */
            className="relative flex max-h-[min(86vh,52rem)] w-full max-w-[46rem] min-h-0 flex-col overflow-hidden rounded-[26px] bg-[#f7f8f4] shadow-[0_40px_100px_-30px_rgba(45,59,41,0.5)] ring-1 ring-black/8 focus:outline-none"
          >
            {/* Header */}
            <div className="shrink-0 border-b border-black/6 bg-white/50 px-6 pb-5 pt-6 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-(--olivea-olive)/85">
                    {c.section}
                  </div>
                  <h2 className="mt-2 font-serif text-[26px] leading-[1.15] text-(--olivea-ink) sm:text-[30px]">
                    {v.title}
                  </h2>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <Meta icon={Layers}>{opening.area}</Meta>
                    <Meta icon={Clock3}>{typeLabel(opening.type, lang)}</Meta>
                    <Meta icon={MapPin}>{opening.location}</Meta>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={c.close}
                  /* 36px for a mouse, 44px for a finger.
                     Keyed to pointer-coarse, not a width breakpoint: this was
                     `h-11 w-11 sm:h-9 sm:w-9`, and every iPad is wider than
                     sm, so tablets — touch devices — got the 35px target. */
                  className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--olivea-ink)/55 transition-colors hover:bg-black/5 hover:text-(--olivea-ink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/40 pointer-coarse:-mr-2 pointer-coarse:-mt-2 pointer-coarse:h-11 pointer-coarse:w-11"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Body — the only scroller in the dialog */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">
              {v.description && (
                <section>
                  <h3 className="text-[11px] uppercase tracking-[0.24em] text-(--olivea-olive)/85">
                    {c.about}
                  </h3>
                  <p className="mt-3 text-[15.5px] leading-[1.85] text-(--olivea-ink)/78">
                    {v.description}
                  </p>
                </section>
              )}

              {v.requirements.length > 0 && (
                <section className="mt-7">
                  <h3 className="text-[11px] uppercase tracking-[0.24em] text-(--olivea-olive)/85">
                    {c.requirements}
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {v.requirements.map((r, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[15px] leading-[1.8] text-(--olivea-ink)/76"
                      >
                        <span
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--olivea-olive)/70"
                          aria-hidden
                        />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {posted && (
                <p className="mt-7 text-[12px] text-(--olivea-ink)/45">
                  {c.posted} · {posted}
                </p>
              )}
            </div>

            {/* Footer CTA */}
            <div className="shrink-0 border-t border-black/6 bg-white/50 px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={applyToRole}
                /* px-7 py-3 lands at 42px, 2px under the minimum tap target.
                   min-h rather than more padding, so the button keeps its
                   proportions and only the touch case grows. */
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--olivea-olive) px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white ring-1 ring-white/10 transition-colors duration-300 hover:bg-(--olivea-clay) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/45 pointer-coarse:min-h-11 sm:w-auto"
              >
                {c.apply}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(dialog, document.body) : null;
}
