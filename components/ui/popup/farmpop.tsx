// components/ui/popup/farmpop.tsx
"use client";

import { useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type Variants,
  type Transition,
} from "framer-motion";
import { X } from "lucide-react";

type MenuTab = { id: string; label: string; url: string; emoji?: string; icon?: ReactNode };

type FarmpopProps = {
  canvaUrl?: string;              // single Canva URL (ignored if tabs provided)
  tabs?: MenuTab[];               // list of tabbed menus
  initialTabId?: string;
  label?: string;
  title?: string;                 // desktop title
  trigger?: ReactNode;
  triggerClassName?: string;
  autoOpenEvent?: string;         // e.g., "olivea:menu:open"
  openDelayMs?: number;
};

export default function Farmpop({
  canvaUrl,
  tabs,
  initialTabId,
  label = "Ver menú en vivo",
  title = "Menú en vivo",
  trigger,
  triggerClassName = "",
  autoOpenEvent = "olivea:menu:open",
  openDelayMs = 80,
}: FarmpopProps) {
  const [open, setOpen] = useState(false);
  const [preloaded, setPreloaded] = useState(false); // mount all iframes once popup opens
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 767px)").matches
  );

  // Normalize to a single unified tab list
  const tabList: MenuTab[] = useMemo(() => {
    if (tabs && tabs.length) {
      return tabs.map(t => ({ ...t, url: t.url.includes("?embed") ? t.url : `${t.url}?embed` }));
    }
    if (canvaUrl) {
      const u = canvaUrl.includes("?embed") ? canvaUrl : `${canvaUrl}?embed`;
      return [{ id: "single", label: "Menú", url: u }];
    }
    return [];
  }, [tabs, canvaUrl]);

  // Active / previous for cross-fade
  const [activeId, setActiveId] = useState<string>(() => {
    if (tabList.length) {
      return initialTabId && tabList.some(t => t.id === initialTabId) ? (initialTabId as string) : tabList[0].id;
    }
    return "single";
  });
  const [prevId, setPrevId] = useState<string | null>(null);

  // Fade duration (respects prefers-reduced-motion)
  const FADE_MS = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
  }, []);

  // keep activeId valid if the tab list changes
  useEffect(() => {
    if (!tabList.length) return;
    if (!tabList.some(t => t.id === activeId)) setActiveId(tabList[0].id);
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

  // Lock body scroll while open (pair with html { scrollbar-gutter: stable; } in globals.css)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Pre-mount all iframes once the popup is opened the first time
  useEffect(() => {
    if (open && !preloaded) setPreloaded(true);
  }, [open, preloaded]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-open when navigating with hash/session flags
  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldOpen = sessionStorage.getItem("olivea:autoopen-menu") === "1";
    const atMenuHash = window.location.hash === "#menu";

    if (shouldOpen && atMenuHash) {
      sessionStorage.removeItem("olivea:autoopen-menu");

      const savedTab = sessionStorage.getItem("olivea:autoopen-tab");
      if (savedTab && tabList?.some(t => t.id === savedTab)) {
        setActiveId(savedTab);
      }
      sessionStorage.removeItem("olivea:autoopen-tab");

      const t = window.setTimeout(() => setOpen(true), openDelayMs + 150);
      return () => window.clearTimeout(t);
    }
  }, [tabList, openDelayMs]);

  const openPopup  = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  // Gentle switch: set prev → set active; prev clears on transition end
  const switchTab = useCallback((nextId: string) => {
    if (nextId === activeId) return;
    setPrevId(activeId);
    setActiveId(nextId);
    if (FADE_MS === 0) setPrevId(null); // instantly drop on reduced motion
  }, [activeId, FADE_MS]);

  // Drop previous once the opacity transition actually ends
  const handleFadeOutEnd: React.TransitionEventHandler<HTMLIFrameElement> = (e) => {
    if (e.propertyName !== "opacity") return;
    setPrevId(null);
  };

  // Motion variants
  const modalVariants: Variants = {
    hidden:  isMobile ? { y: "-100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
    visible: isMobile ? { y: 0,        opacity: 1 } : { scale: 1,   opacity: 1 },
    exit:    isMobile ? { y: "-100%",  opacity: 0 } : { scale: 0.9, opacity: 0 },
  };
  const backdropVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const transition: Transition = isMobile ? { type: "spring", stiffness: 200, damping: 25 } : { duration: 0.35, ease: "easeOut" };
  const contentVariants: Variants = {
    hidden:  isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    visible: isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
    exit:    isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 },
  };
  const contentTransition: Transition = isMobile ? { duration: 0 } : { duration: 0.25, ease: "easeOut", delay: 0.06 };

  // Mobile drag (desktop gets no drag props at all)
  const dragControls = useDragControls();
  const CLOSE_PX = 140;
  const CLOSE_VELOCITY = -600;
  const mobileDragProps = isMobile
    ? {
        drag: "y" as const,
        dragControls,
        dragListener: false,
        dragConstraints: { top: -CLOSE_PX, bottom: 0 },
        dragElastic: 0,
        dragMomentum: false,
        onDragEnd: (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
          if (info.offset.y < -(CLOSE_PX * 0.6) || info.velocity.y < CLOSE_VELOCITY) {
            setOpen(false);
          }
        },
      }
    : {};

  const tabGlyph = (t: MenuTab): ReactNode => {
    if (t.icon) return t.icon;
    if (t.emoji) return <span className="text-[16px] leading-none">{t.emoji}</span>;
    const map: Record<string, string> = { menu: "🍽️", licores: "🥃", vinos: "🍷", bebidas: "🍹" };
    return <span className="text-[16px] leading-none">{map[t.id] ?? "📄"}</span>;
  };

  // Desktop rail tile
  const RailTile = ({ t }: { t: MenuTab }) => {
    const active = activeId === t.id;
    return (
      <button
        role="tab"
        aria-selected={active}
        onClick={() => switchTab(t.id)}
        className={[
          "group w-full rounded-xl transition-all text-left ring-1 ring-white/20",
          active
            ? "bg-[var(--olivea-olive)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
            : "bg-white/50 text-[var(--olivea-ink)]/90 hover:bg-white/70",
        ].join(" ")}
        style={{ height: 72 }}
      >
        <div className="h-full px-4 flex items-center gap-3">
          <span className={["h-10 w-[3px] rounded-full", active ? "bg-white" : "bg-transparent group-hover:bg-black/20"].join(" ")} />
          <div className="flex items-center gap-2">
            <span aria-hidden>{tabGlyph(t)}</span>
            <span className="text-[12.5px] uppercase tracking-[0.18em]">{t.label}</span>
          </div>
        </div>
      </button>
    );
  };

  // Mobile chip
  const Chip = ({ t }: { t: MenuTab }) => {
    const active = activeId === t.id;
    return (
      <button
        data-no-drag="true"
        role="tab"
        aria-selected={active}
        onClick={() => switchTab(t.id)}
        className={[
          "shrink-0 inline-flex items-center text-[12px] uppercase tracking-[0.18em] pb-1",
          active
            ? "text-[var(--olivea-olive)] border-b-2 border-[var(--olivea-olive)]"
            : "text-[var(--olivea-ink)]/80 hover:text-[var(--olivea-olive)]",
        ].join(" ")}
      >
        {t.label}
      </button>
    );
  };

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <span onClick={openPopup}>{trigger}</span>
      ) : (
        <button
          type="button"
          onClick={openPopup}
          className={[
            "px-5 py-3 rounded-xl border border-black/15",
            "hover:bg-black hover:text-white transition",
            triggerClassName,
          ].join(" ")}
        >
          {label}
        </button>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <>
            {/* Backdrop — no blur on desktop */}
            <motion.div
              className={`fixed inset-0 z-[1200] ${isMobile ? "bg-black/40 backdrop-blur-sm" : "bg-black/40"}`}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={closePopup}
            />

            {/* Panel container */}
            <motion.div
              className={`fixed inset-0 z-[1300] flex ${isMobile ? "items-start justify-center" : "items-center justify-center p-4"}`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
            >
              {/* Panel */}
              <motion.div
                className={
                  (isMobile
                    ? "w-full h-[90dvh] rounded-b-2xl overflow-hidden border-b border-white/10 "
                    : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-white/10 "
                  ) +
                  // desktop: no backdrop-blur (smoother with iframes), mobile keeps it
                  (isMobile ? "bg-[color:var(--olivea-cream)]/90 backdrop-blur-md " : "bg-[color:var(--olivea-cream)]/96 ") +
                  "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col"
                }
                onClick={(e) => e.stopPropagation()}
                {...mobileDragProps} // drag only on mobile
              >
                <motion.div
                  className="flex h-full w-full flex-col"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={contentTransition}
                >
                  {/* Desktop header */}
                  {!isMobile && (
                    <div className="relative flex items-center px-6 py-4 border-b border-white/20 flex-shrink-0">
                      <h2
                        className="absolute inset-0 flex items-center justify-center pointer-events-none uppercase tracking-[0.25em]"
                        style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 200 }}
                      >
                        {title}
                      </h2>
                      <button
                        onClick={closePopup}
                        aria-label="Cerrar"
                        className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="flex-1 min-h-0 flex">
                    {/* Desktop left rail */}
                    {!isMobile && tabList.length >= 2 && (
                      <aside
                        className="hidden md:flex flex-col shrink-0 w-[260px] bg-[color:var(--olivea-cream)]/96 border-r border-white/20 px-4 py-4 gap-3"
                        role="tablist"
                        aria-orientation="vertical"
                      >
                        {tabList.map((t) => (
                          <RailTile key={t.id} t={t} />
                        ))}
                        <div className="flex-1" />
                      </aside>
                    )}

                    {/* Right: keep-alive iframes with cross-fade */}
                    <div
                      className="relative flex-1 min-h-0 bg-[color:var(--olivea-cream)]"
                      style={{
                        contain: "layout paint size",
                        transform: "translateZ(0)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {preloaded &&
                        tabList.map((t) => {
                          const isActive = t.id === activeId;
                          const isPrev   = t.id === prevId;

                          const visibilityClass =
                            isActive
                              ? "opacity-100 visible pointer-events-auto z-20"
                              : isPrev
                                ? "opacity-0 visible pointer-events-none z-30"
                                : "opacity-0 invisible pointer-events-none z-10";

                          return (
                            <iframe
                              key={t.id}
                              src={t.url}
                              title={`Menú: ${t.label}`}
                              className={
                                "absolute inset-0 w-full h-full block will-change-opacity " +
                                `transition-opacity duration-[${FADE_MS}ms] ease-[cubic-bezier(.22,1,.36,1)] ` +
                                visibilityClass
                              }
                              style={{ border: 0 }}
                              loading={isActive ? "eager" : "lazy"}
                              allow="fullscreen"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              onTransitionEnd={isPrev ? handleFadeOutEnd : undefined}
                            />
                          );
                        })}

                      {/* First open fallback before preloaded */}
                      {!preloaded && tabList.length > 0 && (
                        <iframe
                          src={tabList.find(t => t.id === activeId)?.url || tabList[0].url}
                          title="Menú en vivo"
                          className="absolute inset-0 w-full h-full block"
                          style={{ border: 0 }}
                          loading="eager"
                          allow="fullscreen"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      )}
                    </div>
                  </div>

                  {/* MOBILE bottom bar */}
                  {isMobile && tabList.length >= 2 && (
                    <div
                      className="relative flex items-center gap-2 px-2 py-2 border-t border-white/20 flex-shrink-0 cursor-grab active:cursor-grabbing bg-white/40"
                      style={{ touchAction: "none" }}
                      onPointerDown={(e) => {
                        const t = e.target as HTMLElement;
                        if (t.closest('[data-no-drag="true"]')) return;
                        dragControls.start(e.nativeEvent as PointerEvent);
                      }}
                    >
                      <button
                        data-no-drag="true"
                        onClick={closePopup}
                        aria-label="Cerrar"
                        className="p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors"
                      >
                        <X size={18} />
                      </button>

                      <div data-no-drag="true" className="flex-1 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-6 px-2" role="tablist" aria-orientation="horizontal">
                          {tabList.map((t) => (
                            <Chip key={t.id} t={t} />
                          ))}
                        </div>
                      </div>

                      <span className="absolute left-1/2 -translate-x-1/2 -top-2 h-1.5 w-12 rounded-full bg-black/15" />
                      <span className="w-9" />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
