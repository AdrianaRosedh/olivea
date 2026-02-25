// app/(main)/[lang]/press/PressDockLeft.tsx
"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { Identity, ItemKind, Lang, PressItem } from "./pressTypes";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

import {
  Search,
  SlidersHorizontal,
  Layers,
  X,
  ArrowUp,
  Newspaper,
  Award,
  FolderArchive,
  Mail,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.25 },
  },
};

const TOP_OFFSET_PX = 120;
const MANUAL_MS = 950;

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

export default function PressDockLeft({
  lang,
  items,
  kind,
  setKind,
  identity,
  setIdentity,
  year,
  setYear,
  q,
  setQ,
  count,
}: {
  lang: Lang;
  items: PressItem[];

  kind: ItemKind;
  setKind: (v: ItemKind) => void;

  identity: Identity;
  setIdentity: (v: Identity) => void;

  year: number | "all";
  setYear: (v: number | "all") => void;

  q: string;
  setQ: (v: string) => void;

  count: number;
}) {
  const reduce = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);

  // ✅ mobile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);

  // ✅ Desktop gate (prevents desktop behaviors from running on mobile)
  const [isDesktop, setIsDesktop] = useState(false);
  const isDesktopRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)"); // Tailwind md
    const sync = () => {
      setIsDesktop(mq.matches);
      isDesktopRef.current = mq.matches;
    };
    sync();

    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else mq.removeListener(sync);
    };
  }, []);

  // ✅ mobile bar hide/show (Safari-like)
  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    // ✅ MOBILE ONLY
    if (isDesktopRef.current) return;

    const prev = lastY.current;
    lastY.current = y;

    // don't hide/show while sheet is open
    if (sheetOpen) return;

    // near top: always show
    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;

    const HIDE_DELTA = 14;
    const SHOW_DELTA = -2;

    if (delta > HIDE_DELTA) {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setBarHidden(true);
      }
      return;
    }

    if (delta < SHOW_DELTA) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
    }
  });

  const unlockTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    unlockTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const years = useMemo(() => {
    const s = new Set<number>();
    items.forEach((a) => {
      const y = Number(a.publishedAt.slice(0, 4));
      if (Number.isFinite(y)) s.add(y);
    });
    return Array.from(s).sort((a, b) => b - a);
  }, [items]);

  const countsByIdentity = useMemo(() => {
    const base = {
      all: items.length,
      olivea: 0,
      hotel: 0,
      restaurant: 0,
      cafe: 0,
    } as Record<Identity, number>;
    for (const it of items) base[it.for] += 1;
    return base;
  }, [items]);

  const chipBase = cn(
    "px-2.5 py-1 rounded-full text-[11px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/14",
    "bg-white/12 text-(--olivea-clay) opacity-95",
    "hover:bg-white/18 hover:text-(--olivea-olive) hover:opacity-100"
  );

  const chipActive = cn(
    "px-2.5 py-1 rounded-full text-[11px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/26",
    "bg-(--olivea-olive)/12 text-(--olivea-olive) opacity-100"
  );

  const kindLabel = (k: ItemKind) => {
    if (k === "all") return tt(lang, "Todo", "All");
    if (k === "award") return tt(lang, "Reconoc.", "Awards");
    return tt(lang, "Prensa", "Press");
  };

  const identLabel = (x: Identity) => {
    if (x === "all") return tt(lang, "Todos", "All");
    if (x === "olivea") return `Olivea (${countsByIdentity.olivea})`;
    if (x === "hotel") return `${tt(lang, "Hotel", "Hotel")} (${countsByIdentity.hotel})`;
    if (x === "restaurant") return `${tt(lang, "Rest.", "Rest.")} (${countsByIdentity.restaurant})`;
    return `${tt(lang, "Café", "Café")} (${countsByIdentity.cafe})`;
  };

  const topYearPicks = years.slice(0, 4);

  // ---- Smooth scroll to section (GSAP) ----
  const scrollToSection = useCallback(
    (id: string) => {
      if (!isDesktopRef.current) return;

      const el =
        document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
        document.getElementById(id);

      if (!el) return;

      clearTimers();
      gsap.killTweensOf(window);

      gsap.to(window, {
        duration: reduce ? 0 : 0.95,
        ease: "power3.out",
        overwrite: true,
        scrollTo: {
          y: el,
          offsetY: TOP_OFFSET_PX,
          autoKill: true,
        },
      });

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }

      safetyTimer.current = window.setTimeout(() => {}, MANUAL_MS + 250);
    },
    [clearTimers, reduce]
  );

  const onNav = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();

      // ✅ mobile: native smooth scroll (no GSAP)
      if (!isDesktopRef.current) {
        const el =
          document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
          document.getElementById(id);
        if (el) {
          el.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
        }
        setSheetOpen(false);
        return;
      }

      // ✅ desktop: GSAP
      scrollToSection(id);
      setSheetOpen(false);
    },
    [reduce, scrollToSection]
  );

  // deep link on mount — ✅ DESKTOP ONLY
  useEffect(() => {
    if (!isDesktop) return;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    let tries = 0;
    const kick = () => {
      const el = document.getElementById(hash);
      if (!el && ++tries < 40) return window.setTimeout(kick, 50);
      if (!el) return;
      scrollToSection(hash);
    };
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // ✅ lock body scroll when mobile sheet open
  useEffect(() => {
    if (!sheetOpen) return;

    setModalOpen(true);
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [sheetOpen]);

  /* =========================
     MOBILE UI (kept as-is)
     ========================= */

  const TOP_OFFSET_CLASS = "top-14";
  const BAR_HEIGHT_SPACER = "h-16";

  const mobileBar = (
    <>
      <div className={cn("md:hidden", BAR_HEIGHT_SPACER)} />

      <motion.div
        className={cn(
          "md:hidden fixed left-0 right-0 z-210",
          TOP_OFFSET_CLASS,
          "pointer-events-none"
        )}
        animate={barHidden ? "hidden" : "show"}
        variants={{
          show: { y: 0, opacity: 1 },
          hidden: { y: -48, opacity: 0 },
        }}
        transition={{
          duration: barHidden ? 0.38 : 0.18,
          ease: EASE,
        }}
      >
        {/* (your mobile bar + sheet stays exactly as you pasted) */}
        {/* --- SNIP: keep your existing mobileBar block here unchanged --- */}
        {/* For brevity in this message, I’m not re-pasting it. */}
      </motion.div>
    </>
  );

  /* =========================
     DESKTOP: collapsable Press Dock
     ========================= */

  const COLLAPSE_AT = 1180;
  const [collapsed, setCollapsed] = useState(false);
  const userOverride = useRef<boolean | null>(null);

  useEffect(() => {
    const onResize = () => {
      if (userOverride.current !== null) return;
      setCollapsed(window.innerWidth <= COLLAPSE_AT);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleCollapsed = () => {
    userOverride.current = !collapsed;
    setCollapsed((v) => !v);
  };

  // allow the PressClient to slide left/right (same pattern as Team)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--press-dock-left", collapsed ? "5.0rem" : "18.25rem");
    return () => {
      root.style.removeProperty("--press-dock-left");
    };
  }, [collapsed]);

  const anyFiltersOn = q || identity !== "all" || kind !== "all" || year !== "all";

  const resetAll = () => {
    setQ("");
    setIdentity("all");
    setKind("all");
    setYear("all");
  };

  const panelShell = cn(
    "rounded-3xl",
    "bg-(--olivea-cream)/62 backdrop-blur-md",
    "ring-1 ring-(--olivea-olive)/14",
    "shadow-[0_10px_28px_rgba(18,24,16,0.10)]"
  );

  const sectionLabel = cn(
    "text-[10px] uppercase tracking-[0.28em]",
    "text-(--olivea-olive) opacity-75"
  );

  const inputShell = cn(
    "rounded-2xl",
    "bg-white/14 ring-1 ring-(--olivea-olive)/14",
    "backdrop-blur-[2px]"
  );

  const iconBtn = (active?: boolean) =>
    cn(
      "h-11 w-11 rounded-2xl grid place-items-center",
      "ring-1 transition",
      active
        ? "bg-(--olivea-olive)/12 ring-(--olivea-olive)/26 text-(--olivea-olive)"
        : "bg-white/10 ring-(--olivea-olive)/14 text-(--olivea-olive)/80 hover:bg-white/16 hover:ring-(--olivea-olive)/22"
    );

  const JumpButton = ({
    id,
    icon,
    title,
    subtitle,
    tone = "neutral",
  }: {
    id: string;
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    tone?: "neutral" | "primary";
  }) => {
    return (
      <button
        type="button"
        onClick={(e) => onNav(e as unknown as React.MouseEvent, id)}
        className={cn(
          "w-full text-left rounded-2xl px-3 py-3 ring-1 transition",
          tone === "primary"
            ? "bg-(--olivea-olive) text-(--olivea-cream) ring-black/10 shadow-[0_10px_22px_rgba(40,60,35,0.16)] hover:brightness-[1.03]"
            : "bg-white/12 text-(--olivea-olive) ring-(--olivea-olive)/14 hover:bg-white/18"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("opacity-85", tone === "primary" ? "text-(--olivea-cream)" : "text-(--olivea-olive)")}>
            {icon}
          </span>
          <span className="text-[13px] font-medium">{title}</span>
        </div>
        {subtitle ? (
          <div className={cn("mt-1 text-[12px]", tone === "primary" ? "opacity-80" : "text-(--olivea-clay) opacity-75")}>
            {subtitle}
          </div>
        ) : null}
      </button>
    );
  };

  const DesktopExpanded = (
    <motion.div
      className={cn(panelShell, "w-73")}
      initial={false}
      animate={{ width: "18.25rem" }}
      transition={{ duration: 0.26, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      {/* header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div className="min-w-0">
          <div className={sectionLabel}>{tt(lang, "Prensa", "Press")}</div>
          <div className="mt-1 text-[12px] text-(--olivea-olive) opacity-80">
            {count} {tt(lang, "items", "items")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {anyFiltersOn ? (
            <button
              type="button"
              onClick={resetAll}
              className={cn(
                "h-10 w-10 rounded-2xl grid place-items-center",
                "bg-white/16 ring-1 ring-(--olivea-olive)/14",
                "text-(--olivea-olive) hover:bg-white/22 transition"
              )}
              aria-label={tt(lang, "Limpiar", "Reset")}
              title={tt(lang, "Limpiar", "Reset")}
            >
              <X className="h-4 w-4 opacity-85" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "h-10 w-10 rounded-2xl grid place-items-center",
              "bg-white/16 ring-1 ring-(--olivea-olive)/14",
              "text-(--olivea-olive) hover:bg-white/22 transition"
            )}
            aria-label={tt(lang, "Colapsar", "Collapse")}
            title={tt(lang, "Colapsar", "Collapse")}
          >
            <Layers className="h-4 w-4 opacity-85" />
          </button>
        </div>
      </div>

      {/* search */}
      <div className="px-4 pb-4">
        <div className={sectionLabel}>{tt(lang, "Buscar", "Search")}</div>
        <div className={cn("mt-2 px-3 py-2.5 flex items-center gap-2", inputShell)}>
          <Search className="h-4 w-4 opacity-70 text-(--olivea-olive) shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tt(lang, "Título, medio, tag…", "Title, outlet, tag…")}
            className={cn(
              "w-full bg-transparent outline-none",
              "text-[13px] text-(--olivea-olive)",
              "placeholder:text-(--olivea-clay)/65"
            )}
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center",
                "bg-white/18 ring-1 ring-(--olivea-olive)/14",
                "text-(--olivea-olive) opacity-80 hover:opacity-100 transition"
              )}
              aria-label={tt(lang, "Borrar", "Clear")}
              title={tt(lang, "Borrar", "Clear")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* jump */}
      <div className="px-4 pb-4">
        <div className={sectionLabel}>{tt(lang, "Secciones", "Sections")}</div>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <JumpButton
            id="awards"
            icon={<Award className="h-4 w-4" />}
            title={tt(lang, "Reconocimientos", "Awards")}
            subtitle={tt(lang, "Premios & guías", "Awards & guides")}
          />
          <JumpButton
            id="mentions"
            icon={<Newspaper className="h-4 w-4" />}
            title={tt(lang, "Menciones", "Press mentions")}
            subtitle={tt(lang, "Artículos & notas", "Articles & notes")}
          />
          <JumpButton
            id="presskit"
            icon={<FolderArchive className="h-4 w-4" />}
            title={tt(lang, "Press Kit y Media", "Press Kit & Media")}
            subtitle={tt(lang, "Descargas oficiales", "Official downloads")}
            tone="primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <JumpButton
              id="contact"
              icon={<Mail className="h-4 w-4" />}
              title={tt(lang, "Contacto", "Contact")}
              subtitle={tt(lang, "PR & medios", "Media & PR")}
            />
            <JumpButton
              id="top"
              icon={<ArrowUp className="h-4 w-4" />}
              title={tt(lang, "Arriba", "Top")}
              subtitle={tt(lang, "Inicio", "Top")}
            />
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className={sectionLabel}>{tt(lang, "Filtrar", "Filter")}</div>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="text-[12px] text-(--olivea-olive) opacity-75 hover:opacity-100 underline underline-offset-4"
          >
            {moreOpen ? tt(lang, "Menos", "Less") : tt(lang, "Más", "More")}
          </button>
        </div>

        {/* Identity */}
        <div className="mt-2 flex flex-wrap gap-2">
          {(["all", "olivea", "hotel", "restaurant", "cafe"] as Identity[]).map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => setIdentity(x)}
              className={identity === x ? chipActive : chipBase}
            >
              {identLabel(x)}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {moreOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: EASE }}
              className={cn("mt-3 rounded-2xl bg-white/10 ring-1 ring-(--olivea-olive)/14 p-3")}
            >
              {/* Type */}
              <div className="text-[11px] text-(--olivea-olive) opacity-80">
                {tt(lang, "Tipo", "Type")}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["all", "award", "mention"] as ItemKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={kind === k ? chipActive : chipBase}
                  >
                    {kindLabel(k)}
                  </button>
                ))}
              </div>

              {/* Year */}
              <div className="mt-3 text-[11px] text-(--olivea-olive) opacity-80">
                {tt(lang, "Año", "Year")}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setYear("all")}
                  className={year === "all" ? chipActive : chipBase}
                >
                  {tt(lang, "Todos", "All")}
                </button>
                {topYearPicks.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={year === y ? chipActive : chipBase}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const DesktopCollapsed = (
    <motion.div
      className={cn(panelShell, "w-16")}
      initial={false}
      animate={{ width: "4rem" }}
      transition={{ duration: 0.26, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      <div className="px-2 py-3 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          className={iconBtn(true)}
          aria-label={tt(lang, "Expandir", "Expand")}
          title={tt(lang, "Expandir", "Expand")}
        >
          <Layers className="h-4 w-4 opacity-90" />
        </button>

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={iconBtn(moreOpen)}
          aria-label={tt(lang, "Filtros", "Filters")}
          title={tt(lang, "Filtros", "Filters")}
        >
          <SlidersHorizontal className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "awards")}
          className={iconBtn()}
          aria-label={tt(lang, "Reconocimientos", "Awards")}
          title={tt(lang, "Reconocimientos", "Awards")}
        >
          <Award className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "mentions")}
          className={iconBtn()}
          aria-label={tt(lang, "Prensa", "Press")}
          title={tt(lang, "Prensa", "Press")}
        >
          <Newspaper className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "presskit")}
          className={cn(iconBtn(), "bg-(--olivea-olive)/10")}
          aria-label={tt(lang, "Press Kit", "Press Kit")}
          title={tt(lang, "Press Kit", "Press Kit")}
        >
          <FolderArchive className="h-4 w-4 opacity-90" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "contact")}
          className={iconBtn()}
          aria-label={tt(lang, "Contacto", "Contact")}
          title={tt(lang, "Contacto", "Contact")}
        >
          <Mail className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "top")}
          className={iconBtn()}
          aria-label={tt(lang, "Arriba", "Top")}
          title={tt(lang, "Arriba", "Top")}
        >
          <ArrowUp className="h-4 w-4 opacity-85" />
        </button>
      </div>
    </motion.div>
  );

  const desktopDock = (
    <nav
      className="hidden md:block fixed left-4 lg:left-6 z-40 pointer-events-auto"
      style={{ top: 255 }}
      aria-label="Press dock"
    >
      <motion.div variants={dockV} initial={reduce ? false : "hidden"} animate="show">
        {collapsed ? DesktopCollapsed : DesktopExpanded}
      </motion.div>
    </nav>
  );

  return (
    <>
      {mobileBar}
      {desktopDock}
    </>
  );
}