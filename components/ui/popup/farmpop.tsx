// components/ui/popup/farmpop.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { Maximize2, Minimize2, X } from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import { HOUSES } from "@/lib/houses";
import { useHouseText } from "@/lib/uiText/context";
import { cn } from "@/lib/utils";

type MenuTab = {
  id: string;
  label: string;
  url: string;
  emoji?: string;
  icon?: ReactNode;
};

/**
 * Known downstream origins the menu embeds pull their CSS + custom fonts from.
 * roseiies serves the live menu HTML from roseiies.com but its Next.js assets
 * (stylesheet + self-hosted woff2) load from the tenant app origin — a separate
 * host the browser only discovers after parsing the embed. Warming it up front
 * means the menu's custom font paints on first frame instead of flashing a
 * system fallback. Harmless no-op if roseiies changes infra.
 */
const EMBED_ASSET_ORIGINS: ReadonlyArray<{ href: string; cors: boolean }> = [
  { href: "https://roseiies-tenant.vercel.app", cors: true },
];

/**
 * Open TCP+TLS to the embed origins (and their font hosts) the moment the user
 * shows intent to open the menu — hover/focus/click — so the iframe and its
 * custom font are already downloading before it mounts. Idempotent: each origin
 * is warmed at most once per page. `cors` adds crossorigin so the connection is
 * reused by the anonymous-CORS font fetch; without it, it warms the document
 * navigation. Fonts need the CORS variant, so asset origins get both.
 */
function warmEmbedConnections(urls: string[]): void {
  if (typeof document === "undefined") return;

  const add = (href: string, cors: boolean) => {
    const sel = `link[rel="preconnect"][href="${href}"]${cors ? "[data-cors]" : ":not([data-cors])"}`;
    if (document.head.querySelector(sel)) return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    if (cors) {
      link.crossOrigin = "anonymous";
      link.setAttribute("data-cors", "");
    }
    document.head.appendChild(link);
  };

  // Origins straight from the tab URLs (roseiies.com / www.canva.com …): the
  // document navigation, so a plain preconnect.
  for (const u of urls) {
    try {
      add(new URL(u).origin, false);
    } catch {
      /* ignore malformed URLs */
    }
  }
  // Known font/CSS asset hosts — warm the CORS connection the font fetch uses.
  for (const { href, cors } of EMBED_ASSET_ORIGINS) add(href, cors);
}

type FarmpopProps = {
  canvaUrl?: string; // single Canva URL (ignored if tabs provided)
  tabs?: MenuTab[]; // list of tabbed menus
  initialTabId?: string;
  label?: string;
  title?: string;
  /** A short line under the title ("Changes with the harvest"). */
  subtitle?: string;
  /** Whose menu it is: its emblem heads the window. */
  house?: ReservationType;
  /** Show the house's reserve button inside the window, so a guest who has
   *  read the menu books without closing it first. */
  reservable?: boolean;
  lang?: "es" | "en";
  trigger?: ReactNode;
  triggerClassName?: string;
  autoOpenEvent?: string; // e.g., "olivea:menu:open"
  openDelayMs?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Remembers the desktop full-screen choice, as the reservation window does. */
const FULLSCREEN_KEY = "olivea:menu-fullscreen";

export default function Farmpop({
  canvaUrl,
  tabs,
  initialTabId,
  label = "Ver menú en vivo",
  title = "Menú en vivo",
  subtitle,
  house,
  reservable = false,
  lang = "es",
  trigger,
  triggerClassName = "",
  autoOpenEvent = "olivea:menu:open",
  openDelayMs = 80,
}: FarmpopProps) {
  const [open, setOpen] = useState(false);
  // The house's action line, from admin → Interface text → Houses.
  const houseText = useHouseText(lang);
  // Tabs opened since the modal opened. A tab's iframe is created the first
  // time it is shown and kept while the modal stays open, so switching back is
  // instant. Unopened tabs never load: each embed is a page view for the menu
  // it shows (roseiies counts link visits), and loading menus nobody looked at
  // counted them as seen.
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set());
  // Tabs whose menu has finished loading: until then the frame shows a quiet
  // placeholder instead of an empty box.
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(max-width: 767px)").matches
  );
  const reduce = usePrefersReducedMotion();
  const { openReservationModal } = useReservation();

  // ✅ for portal safety (document only exists client-side)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Normalize to a single unified tab list. `?embed` is a Canva-specific param
  // (Canva's chromeless view). Appending it to non-Canva embeds like roseiies
  // switches them to an embed view that drops the custom font, so only add it
  // for Canva URLs; leave other embeds (e.g. roseiies) as authored.
  const tabList: MenuTab[] = useMemo(() => {
    const embed = (url: string) =>
      /canva\.com/i.test(url) && !url.includes("?embed") ? `${url}?embed` : url;
    if (tabs && tabs.length) {
      return tabs.map((t) => ({ ...t, url: embed(t.url) }));
    }
    if (canvaUrl) {
      return [{ id: "single", label: "Menú", url: embed(canvaUrl) }];
    }
    return [];
  }, [tabs, canvaUrl]);

  // Active / previous for cross-fade
  const [activeId, setActiveId] = useState<string>(() => {
    if (tabList.length) {
      return initialTabId && tabList.some((t) => t.id === initialTabId)
        ? initialTabId
        : tabList[0].id;
    }
    return "single";
  });
  const [prevId, setPrevId] = useState<string | null>(null);

  const FADE_MS = reduce ? 0 : 220;

  // keep activeId valid if tab list changes
  useEffect(() => {
    if (!tabList.length) return;
    if (!tabList.some((t) => t.id === activeId)) setActiveId(tabList[0].id);
  }, [tabList, activeId]);

  // Responsive flag
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Auto-open from external event
  useEffect(() => {
    if (!autoOpenEvent) return;
    const handler = () => window.setTimeout(() => setOpen(true), openDelayMs);
    window.addEventListener(autoOpenEvent, handler);
    return () => window.removeEventListener(autoOpenEvent, handler);
  }, [autoOpenEvent, openDelayMs]);

  // ✅ Lock body scroll while open (FIXED)
  useEffect(() => {
    if (!open) return;

    setModalOpen(true);
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [open]);

  // Closing unmounts every iframe, so the next opening starts from the tab
  // in view rather than reloading every tab visited before.
  useEffect(() => {
    if (!open) return;
    return () => {
      setOpened(new Set());
      setLoaded(new Set());
    };
  }, [open]);

  // Auto-open when arriving from /menu (hash + session flag). The flag is
  // removed only when the menu actually opens: it used to be removed first, so
  // a re-render in the short wait (the parent passes a new tab list each
  // render) cancelled the timer and the retry found no flag. The menu then
  // silently stayed closed for the guest who asked for it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let shouldOpen = false;
    try {
      shouldOpen = sessionStorage.getItem("olivea:autoopen-menu") === "1";
    } catch {
      return;
    }
    if (!shouldOpen || window.location.hash !== "#menu") return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.removeItem("olivea:autoopen-menu");
        const savedTab = sessionStorage.getItem("olivea:autoopen-tab");
        sessionStorage.removeItem("olivea:autoopen-tab");
        if (savedTab && tabList.some((tab) => tab.id === savedTab)) setActiveId(savedTab);
      } catch {
        // storage off: open on the default tab
      }
      warmEmbedConnections(tabList.map((tab) => tab.url));
      setOpen(true);
    }, openDelayMs + 150);
    return () => window.clearTimeout(t);
  }, [tabList, openDelayMs]);

  // Warm the embed + font connections on intent so the custom font is already
  // downloading before the iframe mounts (no fallback-font flash on open).
  const warm = useCallback(
    () => warmEmbedConnections(tabList.map((t) => t.url)),
    [tabList]
  );
  const openPopup = useCallback(() => {
    warm();
    setOpen(true);
  }, [warm]);
  const closePopup = useCallback(() => setOpen(false), []);

  // Reserving closes the menu and opens the house's booking in the same
  // moment: the reservation window sits underneath, so it is already there
  // as the menu fades away.
  const reserve = useCallback(() => {
    if (!house) return;
    setOpen(false);
    openReservationModal(house);
  }, [house, openReservationModal]);

  // Gentle switch: prev → active; prev clears on transition end
  const switchTab = useCallback(
    (nextId: string) => {
      if (nextId === activeId) return;
      setOpened((prev) => new Set(prev).add(activeId).add(nextId));
      setPrevId(activeId);
      setActiveId(nextId);
      if (FADE_MS === 0) setPrevId(null);
    },
    [activeId, FADE_MS]
  );

  // Drop previous once opacity transition ends
  const handleFadeOutEnd: React.TransitionEventHandler<HTMLDivElement> = (e) => {
    if (e.propertyName !== "opacity") return;
    setPrevId(null);
  };

  // Focus starts on the tab in view and stays inside the window; Escape
  // closes it and focus returns to the button that opened it.
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: closePopup,
    initialFocusRef: tabList.length >= 2 ? activeTabRef : undefined,
  });

  // The phone's tab row scrolls sideways: keep the chosen tab in view.
  const tabRowRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const row = tabRowRef.current;
    const tab = activeTabRef.current;
    if (!row || !tab) return;
    const left = tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [open, activeId, isMobile, reduce]);

  // Arrow keys move between tabs, as in any tab list.
  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = tabList.findIndex((t) => t.id === activeId);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabList.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabList.length) % tabList.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabList.length - 1;
    if (next < 0) return;
    e.preventDefault();
    switchTab(tabList[next].id);
    requestAnimationFrame(() => activeTabRef.current?.focus());
  };

  const es = lang === "es";
  const headingId = "farmpop-title";
  const panelId = "farmpop-panel";
  const tabDomId = (id: string) => `farmpop-tab-${id}`;
  const emblem = house ? HOUSES[house].emblem : null;
  const reserveLabel = house ? houseText(house).cue : "";
  const activeLoaded = loaded.has(activeId);

  const windowMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isMobile
      ? { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 28 } }
      : { initial: { opacity: 0, y: 10, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 6, scale: 0.985 } };
  const windowTransition: Transition = { duration: isMobile ? 0.34 : 0.3, ease: EASE };

  const tabRow = tabList.length >= 2 && (
    <div
      ref={tabRowRef}
      role="tablist"
      aria-orientation="horizontal"
      aria-label={es ? "Cartas" : "Menus"}
      onKeyDown={onTabKeyDown}
      className={cn(
        "flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // Desktop: the tabs share the row edge to edge, aligned with the frame.
        // The vertical padding keeps the focus outline inside the scroll box.
        isMobile ? "px-4 py-1" : "-my-1 px-6 py-1"
      )}
      style={
        isMobile
          ? {
              // Soft edges say "there is more this way" without an arrow.
              maskImage: "linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 24px), transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 24px), transparent)",
            }
          : undefined
      }
    >
      {tabList.map((t) => {
        const active = t.id === activeId;
        return (
          <button
            key={t.id}
            ref={active ? activeTabRef : undefined}
            id={tabDomId(t.id)}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => switchTab(t.id)}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-4",
              isMobile ? "h-9" : "h-10 flex-1",
              "text-[11.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-200",
              active
                ? "text-(--olivea-cream)"
                : "text-(--olivea-olive)/85 ring-1 ring-inset ring-(--olivea-olive)/22 hover:bg-(--olivea-olive)/8"
            )}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {active && (
              <motion.span
                layoutId="farmpop-tab-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-(--olivea-olive) shadow-[0_6px_16px_-8px_rgba(40,60,35,0.6)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Desktop only: the menu can fill the screen, like the reservation window.
  // The choice is remembered. Only the size changes, so open menus keep their
  // place; the resize animates only when the guest clicks.
  const [expanded, setExpanded] = useState(false);
  const [animateResize, setAnimateResize] = useState(false);
  useEffect(() => {
    try {
      setExpanded(localStorage.getItem(FULLSCREEN_KEY) === "1");
    } catch {
      /* storage off: windowed */
    }
  }, []);
  const toggleExpanded = useCallback(() => {
    setAnimateResize(true);
    setExpanded((prev) => {
      try {
        localStorage.setItem(FULLSCREEN_KEY, prev ? "0" : "1");
      } catch {
        /* storage off: the toggle still works for this visit */
      }
      return !prev;
    });
  }, []);
  const fullScreen = expanded && !isMobile;
  const expandLabel = fullScreen
    ? es ? "Salir de pantalla completa" : "Exit full screen"
    : es ? "Pantalla completa" : "Full screen";

  const expandButton = (
    <button
      type="button"
      onClick={toggleExpanded}
      aria-pressed={fullScreen}
      aria-label={expandLabel}
      title={expandLabel}
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full text-(--olivea-olive)",
        "ring-1 ring-inset ring-(--olivea-olive)/22 transition-colors",
        "hover:bg-(--olivea-olive) hover:text-(--olivea-cream)"
      )}
    >
      {fullScreen ? <Minimize2 size={17} strokeWidth={1.6} /> : <Maximize2 size={17} strokeWidth={1.6} />}
    </button>
  );

  const closeButton = (
    <button
      type="button"
      onClick={closePopup}
      aria-label={es ? "Cerrar menú" : "Close menu"}
      className={cn(
        "grid shrink-0 place-items-center rounded-full text-(--olivea-olive)",
        "ring-1 ring-inset ring-(--olivea-olive)/22 transition-colors",
        "hover:bg-(--olivea-olive) hover:text-(--olivea-cream)",
        isMobile ? "h-10 w-10" : "h-11 w-11"
      )}
    >
      <X size={isMobile ? 18 : 19} strokeWidth={1.6} />
    </button>
  );

  const heading = (
    <div className="flex min-w-0 items-center gap-3">
      {emblem && (
        <span
          aria-hidden="true"
          className={cn(
            "relative shrink-0 rounded-full bg-white/60 ring-1 ring-(--olivea-olive)/18",
            isMobile ? "h-10 w-10 p-1.5" : "h-12 w-12 p-2"
          )}
        >
          <span className="relative block h-full w-full">
            <Image src={emblem} alt="" fill sizes="32px" className="object-contain" />
          </span>
        </span>
      )}
      <div className="min-w-0">
        <h2
          id={headingId}
          className="truncate uppercase leading-none text-(--olivea-olive)"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: isMobile ? 19 : 24,
            fontWeight: 400,
            letterSpacing: "0.2em",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <span
            className="mt-1.5 block truncate text-[10.5px] font-semibold uppercase tracking-[0.2em] text-(--olivea-olive)/60"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  const reserveButton = reservable && house && (
    <button
      type="button"
      onClick={reserve}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full",
        "bg-(--olivea-olive) text-(--olivea-cream) transition-colors hover:bg-(--olivea-clay)",
        "shadow-[0_10px_24px_-14px_rgba(40,60,35,0.7)]",
        "text-[12px] font-semibold uppercase tracking-[0.18em]",
        isMobile ? "h-12 w-full" : "h-11 px-6"
      )}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {reserveLabel}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </button>
  );

  // The menu itself, inside a thin olive frame. A tab's iframe is created the
  // first time it is shown (see `opened`) and cross-fades with the last one.
  // The placeholder sits underneath: it shows until the menu paints over it,
  // and a menu that never reports loading (offline) still shows what it has.
  const frame = (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabList.length >= 2 ? tabDomId(activeId) : headingId}
      className={cn(
        "relative min-h-0 flex-1 overflow-hidden ring-1 ring-(--olivea-olive)/18",
        "bg-(--olivea-shell) shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
        isMobile ? "mx-3 rounded-[18px]" : "mx-6 rounded-[20px]"
      )}
      style={{ contain: "layout paint size", transform: "translateZ(0)" }}
    >
      <AnimatePresence>
        {!activeLoaded && (
          <motion.div
            key="placeholder"
            aria-hidden="true"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 grid place-items-center"
          >
            <div className="flex flex-col items-center gap-4">
              {emblem && (
                <span className={cn("relative h-14 w-14 opacity-60", !reduce && "animate-pulse")}>
                  <Image src={emblem} alt="" fill sizes="56px" className="object-contain" />
                </span>
              )}
              <span
                className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-(--olivea-olive)/55"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {es ? "Cargando la carta" : "Loading the menu"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tabList
        .filter((t) => t.id === activeId || opened.has(t.id))
        .map((t) => {
          const isActive = t.id === activeId;
          const isPrev = t.id === prevId;

          return (
            <div
              key={t.id}
              className="absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transition: FADE_MS ? `opacity ${FADE_MS}ms cubic-bezier(.22,1,.36,1)` : undefined,
                willChange: "opacity",
                pointerEvents: isActive ? "auto" : "none",
                zIndex: isActive ? 20 : isPrev ? 10 : 0,
              }}
              onTransitionEnd={isPrev ? handleFadeOutEnd : undefined}
              aria-hidden={!isActive}
            >
              <iframe
                src={t.url}
                title={`${es ? "Carta" : "Menu"}: ${t.label}`}
                className="absolute inset-0 block h-full w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="fullscreen"
                tabIndex={isActive ? 0 : -1}
                onLoad={() => setLoaded((prev) => (prev.has(t.id) ? prev : new Set(prev).add(t.id)))}
              />
            </div>
          );
        })}
    </div>
  );

  const modal = (
    <AnimatePresence initial={false}>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-19990 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closePopup}
            aria-hidden
          />

          <div
            key="window"
            className={cn(
              "pointer-events-none fixed inset-0 z-20000 flex",
              isMobile ? "items-stretch" : cn("items-center justify-center", fullScreen ? "p-0" : "p-4")
            )}
          >
            <motion.div
              ref={trapRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={headingId}
              {...windowMotion}
              transition={windowTransition}
              className={cn(
                "pointer-events-auto flex flex-col bg-(--olivea-cream) text-(--olivea-ink)",
                !isMobile && animateResize && !reduce && "transition-[width,height,border-radius] duration-300 ease-out",
                isMobile
                  ? "h-dvh w-full"
                  : fullScreen
                    ? "h-dvh w-screen rounded-none"
                    : "h-[min(92vh,980px)] w-[min(1120px,94vw)] rounded-[28px] ring-1 ring-(--olivea-olive)/15 shadow-[0_40px_90px_-30px_rgba(20,30,15,0.55)]"
              )}
              style={
                isMobile
                  ? {
                      paddingTop: "max(env(safe-area-inset-top), 14px)",
                      paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
                    }
                  : undefined
              }
            >
              {isMobile ? (
                <>
                  <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3">
                    {heading}
                    {closeButton}
                  </div>
                  {tabRow && <div className="shrink-0 pb-3">{tabRow}</div>}
                  {frame}
                  {reserveButton && <div className="shrink-0 px-3 pt-3">{reserveButton}</div>}
                </>
              ) : (
                <>
                  <div className="flex shrink-0 items-center justify-between gap-6 px-7 pt-6 pb-5">
                    {heading}
                    <div className="flex shrink-0 items-center gap-3">
                      {reserveButton}
                      {expandButton}
                      {closeButton}
                    </div>
                  </div>
                  {tabRow && <div className="shrink-0 pb-4">{tabRow}</div>}
                  {frame}
                  <div className="h-6 shrink-0" />
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {trigger ? (
        <span onClick={openPopup} onPointerEnter={warm} onFocus={warm}>
          {trigger}
        </span>
      ) : (
        <button
          type="button"
          onClick={openPopup}
          onPointerEnter={warm}
          onFocus={warm}
          className={[
            "px-5 py-3 rounded-xl border border-black/15",
            "hover:bg-black hover:text-white transition",
            triggerClassName,
          ].join(" ")}
        >
          {label}
        </button>
      )}

      {mounted && createPortal(modal, document.body)}
    </>
  );
}
