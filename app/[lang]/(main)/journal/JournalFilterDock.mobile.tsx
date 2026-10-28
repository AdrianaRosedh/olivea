// app/(main)/[lang]/journal/JournalFilterDock.mobile.tsx
"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { publicDateYear } from "@/lib/date/public-date";
import { tt } from "@/lib/i18n";
import type { JournalFilterDockProps } from "./JournalFilterDock";
import { ArrowUp, BookOpen, Tag as TagIcon } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  FilterBar,
  FilterButton,
  FilterChip,
  FilterGroup,
  FilterSearch,
  FilterSheet,
  JumpRow,
  SheetFooter,
  filterLink,
} from "@/components/ui/filters/FilterKit";

function labelAll(lang: JournalFilterDockProps["lang"]) {
  return lang === "es" ? "Todos" : "All";
}

/**
 * AdaptiveNavbar render gate:
 * - AdaptiveNavbar returns null unless "isMobileLike" is true
 * - It renders a fixed top bar with class "fixed top-0 ... z-1000"
 */
function findAdaptiveNavbarEl(): HTMLElement | null {
  if (typeof document === "undefined") return null;

  const el = document.querySelector<HTMLElement>(
    'div.fixed.top-0.left-0.right-0.z-1000'
  );
  if (el) return el;

  const all = Array.from(document.querySelectorAll<HTMLElement>("div.z-1000"));
  const candidate = all.find((n) => {
    const cs = window.getComputedStyle(n);
    return cs.position === "fixed" && (n.style.top === "0px" || cs.top === "0px");
  });
  return candidate ?? null;
}

/** How many tags show before "Más": the most used ones. */
const TOP_TAGS = 7;

export default function JournalFilterDockMobile({
  lang,
  posts,
  q,
  setQ,
  pillar,
  setPillar,
  tag,
  setTag,
  year,
  setYear,
  time,
  setTime,
  sort,
  setSort,
  onClear,
}: JournalFilterDockProps) {
  const reduce = usePrefersReducedMotion();

  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const [adaptiveActive, setAdaptiveActive] = useState(false);
  const [navH, setNavH] = useState<number>(64);
  const [showAllTags, setShowAllTags] = useState(false);

  const t = {
    ph: lang === "es" ? "Buscar: título, autor, tag…" : "Search: title, author, tag…",
    searchLabel: lang === "es" ? "Buscar artículos" : "Search articles",
    clear: lang === "es" ? "Limpiar" : "Clear",
    done: lang === "es" ? "Listo" : "Done",
    pillar: lang === "es" ? "Pilar" : "Pillar",
    tag: "Tag",
    year: lang === "es" ? "Año" : "Year",
    time: lang === "es" ? "Lectura" : "Reading",
    sort: lang === "es" ? "Orden" : "Sort",
    newest: lang === "es" ? "Reciente" : "Newest",
    oldest: lang === "es" ? "Antiguo" : "Oldest",
    quick: lang === "es" ? "Rápida" : "Quick",
    medium: lang === "es" ? "Media" : "Medium",
    deep: lang === "es" ? "Profunda" : "Deep",
    filters: lang === "es" ? "Filtros" : "Filters",
    top: lang === "es" ? "Arriba" : "Top",
    featured: lang === "es" ? "Destacado" : "Featured",
    posts: lang === "es" ? "Artículos" : "Posts",
    more: lang === "es" ? "Más" : "More",
    less: lang === "es" ? "Menos" : "Less",
  };

  const anyActive =
    q.trim() ||
    pillar !== "all" ||
    tag !== "all" ||
    year !== "all" ||
    time !== "all" ||
    sort !== "newest";

  // The bar's search is in view, so only the sheet's choices are counted.
  const activeCount =
    (pillar !== "all" ? 1 : 0) +
    (tag !== "all" ? 1 : 0) +
    (year !== "all" ? 1 : 0) +
    (time !== "all" ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

  const pillars = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => s.add(p.pillar));
    return ["all", ...Array.from(s).sort()];
  }, [posts]);

  // Most used first, as on desktop.
  const tags = useMemo(() => {
    const n = new Map<string, number>();
    posts.forEach((p) => (p.tags ?? []).forEach((x) => n.set(x, (n.get(x) ?? 0) + 1)));
    return ["all", ...Array.from(n.keys()).sort((a, b) => (n.get(b)! - n.get(a)!) || a.localeCompare(b))];
  }, [posts]);

  const years = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => {
      const y = publicDateYear(p.publishedAt);
      if (!Number.isNaN(y)) s.add(String(y));
    });
    return ["all", ...Array.from(s).sort((a, b) => Number(b) - Number(a))];
  }, [posts]);

  // Only the lengths some article actually has, as on desktop.
  const readTimes = useMemo(() => {
    const bucket = (m: number) => (m <= 3 ? "quick" : m <= 6 ? "medium" : "deep");
    const have = new Set(posts.map((p) => bucket(p.readingMinutes)));
    return (["all", "quick", "medium", "deep"] as const).filter((k) => k === "all" || have.has(k));
  }, [posts]);

  // A group with a single real value cannot narrow anything.
  const showPillar = pillars.length > 2;
  const showYear = years.length > 2;
  const showTime = readTimes.length > 2;

  const shownTags = showAllTags ? tags : tags.slice(0, TOP_TAGS + 1);
  const hasMoreTags = tags.length > TOP_TAGS + 1;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;

    const measure = () => {
      const el = findAdaptiveNavbarEl();
      const isActive = !!el;
      setAdaptiveActive(isActive);

      if (el) {
        const r = el.getBoundingClientRect();
        const h = Math.max(56, Math.round(r.height));
        setNavH(h);
      }
    };

    const tick = () => {
      raf = 0;
      measure();
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(tick);
    };

    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });

    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      mo.disconnect();
    };
  }, []);

  /* MOBILE BAR hide/show */
  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  // Avoid hiding while typing
  const inputFocusedRef = useRef(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (!adaptiveActive) return;
    if (sheetOpen) return;
    if (inputFocusedRef.current) return;

    const prev = lastY.current;
    lastY.current = y;

    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;
    if (delta > 14) {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setBarHidden(true);
      }
      return;
    }

    if (delta < -2) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
    }
  });

  const scrollTo = useCallback(
    (id: string) => {
      const el =
        document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
        document.getElementById(id);
      if (!el) return;

      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }
      setSheetOpen(false);
    },
    [reduce]
  );

  // Bar sits under AdaptiveNavbar
  const BAR_TOP = navH + 8; // px

  // spacer prevents content jump when bar is fixed
  const BAR_SPACER_PX = 72;

  if (!adaptiveActive) return null;

  return (
    <>
      <div className="lg:hidden" style={{ height: BAR_SPACER_PX }} />

      <FilterBar hidden={barHidden} top={BAR_TOP} className="lg:hidden z-1100">
        <FilterSearch
          className="flex-1"
          value={q}
          onChange={setQ}
          placeholder={t.ph}
          label={t.searchLabel}
          clearLabel={tt(lang, "Borrar", "Clear")}
          onFocus={() => (inputFocusedRef.current = true)}
          onBlur={() => (inputFocusedRef.current = false)}
        />
        <FilterButton onClick={() => setSheetOpen(true)} label={t.filters} activeCount={activeCount} />
      </FilterBar>

      <FilterSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={t.filters}
        closeLabel={tt(lang, "Cerrar", "Close")}
        footer={
          <SheetFooter
            onClear={anyActive ? onClear : undefined}
            clearLabel={t.clear}
            onDone={closeSheet}
            doneLabel={t.done}
          />
        }
      >
        {showPillar ? (
          <FilterGroup label={t.pillar}>
            {pillars.map((p) => (
              <FilterChip key={p} active={pillar === p} onClick={() => setPillar(p)}>
                {p === "all" ? labelAll(lang) : p}
              </FilterChip>
            ))}
          </FilterGroup>
        ) : null}

        {showYear ? (
          <FilterGroup label={t.year}>
            {years.map((y) => (
              <FilterChip key={y} active={year === y} onClick={() => setYear(y)}>
                {y === "all" ? labelAll(lang) : y}
              </FilterChip>
            ))}
          </FilterGroup>
        ) : null}

        {showTime ? (
          <FilterGroup label={t.time}>
            {readTimes.map((k) => (
              <FilterChip key={k} active={time === k} onClick={() => setTime(k)}>
                {k === "all" ? labelAll(lang) : k === "quick" ? t.quick : k === "medium" ? t.medium : t.deep}
              </FilterChip>
            ))}
          </FilterGroup>
        ) : null}

        <FilterGroup label={t.sort}>
          {(["newest", "oldest"] as const).map((s) => (
            <FilterChip key={s} active={sort === s} onClick={() => setSort(s)}>
              {s === "newest" ? t.newest : t.oldest}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup
          label={t.tag}
          action={
            hasMoreTags ? (
              <button
                type="button"
                onClick={() => setShowAllTags((v) => !v)}
                aria-expanded={showAllTags}
                className={filterLink}
              >
                {showAllTags ? t.less : t.more}
              </button>
            ) : null
          }
        >
          {shownTags.map((x) => (
            <FilterChip key={x} active={tag === x} onClick={() => setTag(x)}>
              {x === "all" ? labelAll(lang) : x}
            </FilterChip>
          ))}
        </FilterGroup>

        <div className="grid grid-cols-3 gap-2">
          <JumpRow icon={<ArrowUp className="h-4 w-4" />} label={t.top} onClick={() => scrollTo("top")} />
          <JumpRow icon={<BookOpen className="h-4 w-4" />} label={t.featured} onClick={() => scrollTo("featured")} />
          <JumpRow icon={<TagIcon className="h-4 w-4" />} label={t.posts} onClick={() => scrollTo("posts")} />
        </div>
      </FilterSheet>
    </>
  );
}
