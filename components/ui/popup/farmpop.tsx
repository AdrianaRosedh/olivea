// components/ui/popup/farmpop.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type Variants,
  type Transition,
} from "framer-motion";
import { X } from "lucide-react";

/** Idle scheduler (typed) */
type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type RequestIdleCallback = (
  cb: (deadline: IdleDeadline) => void,
  opts?: { timeout?: number }
) => number;
type CancelIdleCallback = (handle: number) => void;

function scheduleIdle(cb: () => void, timeout = 600): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & {
    requestIdleCallback?: RequestIdleCallback;
    cancelIdleCallback?: CancelIdleCallback;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(() => cb(), { timeout });
    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
    };
  }
  const t = window.setTimeout(cb, 120);
  return () => window.clearTimeout(t);
}

type MenuTab = {
  id: string;
  label: string;
  url: string;
  emoji?: string;
  icon?: ReactNode;
};

type FarmpopProps = {
  canvaUrl?: string; // single Canva URL (ignored if tabs provided)
  tabs?: MenuTab[]; // list of tabbed menus
  initialTabId?: string;
  label?: string;
  title?: string; // desktop title
  trigger?: ReactNode;
  triggerClassName?: string;
  autoOpenEvent?: string; // e.g., "olivea:menu:open"
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
  const [preloaded, setPreloaded] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(max-width: 767px)").matches
  );

  // ✅ for portal safety (document only exists client-side)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Normalize to a single unified tab list (force ?embed for Canva)
  const tabList: MenuTab[] = useMemo(() => {
    if (tabs && tabs.length) {
      return tabs.map((t) => ({
        ...t,
        url: t.url.includes("?embed") ? t.url : `${t.url}?embed`,
      }));
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
      return initialTabId && tabList.some((t) => t.id === initialTabId)
        ? initialTabId
        : tabList[0].id;
    }
    return "single";
  });
  const [prevId, setPrevId] = useState<string | null>(null);

  // Fade duration (respects prefers-reduced-motion)
  const FADE_MS = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 220;
  }, []);

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

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Pre-mount all iframes once opened first time — idle time
  useEffect(() => {
    if (!open || preloaded || tabList.length === 0) return;
    const cancel = scheduleIdle(() => setPreloaded(true), 600);
    return cancel;
  }, [open, preloaded, tabList.length]);

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
      if (savedTab && tabList.some((t) => t.id === savedTab)) {
        setActiveId(savedTab);
      }
      sessionStorage.removeItem("olivea:autoopen-tab");
      const t = window.setTimeout(() => setOpen(true), openDelayMs + 150);
      return () => window.clearTimeout(t);
    }
  }, [tabList, openDelayMs]);

  const openPopup = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  // Gentle switch: prev → active; prev clears on transition end
  const switchTab = useCallback(
    (nextId: string) => {
      if (nextId === activeId) return;
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

  // Motion variants
  const modalVariants: Variants = {
    hidden: isMobile ? { y: "-100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
    visible: isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 },
    exit: isMobile ? { y: "-100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
  };
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 200, damping: 25 }
    : { duration: 0.35, ease: "easeOut" };

  const contentVariants: Variants = {
    hidden: isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    visible: isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
    exit: isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 },
  };
  const contentTransition: Transition = isMobile
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeOut", delay: 0.06 };

  // Mobile drag
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
        onDragEnd: (
          _: unknown,
          info: { offset: { y: number }; velocity: { y: number } }
        ) => {
          if (
            info.offset.y < -(CLOSE_PX * 0.6) ||
            info.velocity.y < CLOSE_VELOCITY
          ) {
            setOpen(false);
          }
        },
      }
    : {};

  const tabGlyph = (t: MenuTab): ReactNode => {
    if (t.icon) return t.icon;
    if (t.emoji) return <span className="text-[16px] leading-none">{t.emoji}</span>;
    const map: Record<string, string> = {
      menu: "🍽️",
      licores: "🥃",
      vinos: "🍷",
      bebidas: "🍹",
    };
    return <span className="text-[16px] leading-none">{map[t.id] ?? "📄"}</span>;
  };

  const RailTile = ({ t }: { t: MenuTab }) => {
    const active = activeId === t.id;
    return (
      <button
        role="tab"
        aria-selected={active}
        onClick={() => switchTab(t.id)}
        className={[
          "group w-full rounded-xl transition-all text-left",
          "ring-1 ring-black/10",
          active
            ? "bg-(--olivea-olive) text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
            : "bg-white/55 text-(--olivea-ink)/90 hover:bg-white/70",
        ].join(" ")}
        style={{ height: 72 }}
      >
        <div className="h-full px-4 flex items-center gap-3">
          <span
            className={[
              "h-10 w-0.75 rounded-full",
              active ? "bg-white" : "bg-transparent group-hover:bg-black/20",
            ].join(" ")}
          />
          <div className="flex items-center gap-2">
            <span aria-hidden>{tabGlyph(t)}</span>
            <span className="text-[12.5px] uppercase tracking-[0.18em]">
              {t.label}
            </span>
          </div>
        </div>
      </button>
    );
  };

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
            ? "text-(--olivea-olive) border-b-2 border-(--olivea-olive)"
            : "text-(--olivea-ink)/80 hover:text-(--olivea-olive)",
        ].join(" ")}
      >
        {t.label}
      </button>
    );
  };

  const headingId = "farmpop-title";

  // ✅ Build modal once, then portal it to body
  const modal = (
    <AnimatePresence mode="wait" initial={false}>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 z-19990 ${
              isMobile ? "bg-black/40 backdrop-blur-sm" : "bg-black/40"
            }`}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={closePopup}
            aria-hidden
          />

          {/* Panel container */}
          <motion.div
            className={`fixed inset-0 z-20000 flex ${
              isMobile
                ? "items-start justify-center"
                : "items-center justify-center p-4"
            }`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
          >
            {/* Panel */}
            <motion.div
              className={[
                isMobile
                  ? "w-full h-[90dvh] rounded-b-2xl overflow-hidden border-b border-black/10"
                  : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-black/10",
                "bg-(--olivea-cream)",
                "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col",
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
              {...mobileDragProps}
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
                  <div className="relative flex items-center px-6 py-4 shrink-0 border-b border-black/10 bg-(--olivea-cream)">
                    <h2
                      id={headingId}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none uppercase tracking-[0.25em]"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 28,
                        fontWeight: 200,
                      }}
                    >
                      {title}
                    </h2>
                    <button
                      onClick={closePopup}
                      aria-label="Cerrar"
                      className="ml-auto p-2 rounded-full hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
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
                      className="hidden md:flex flex-col shrink-0 w-65 bg-(--olivea-cream) border-r border-black/10 px-4 py-4 gap-3"
                      role="tablist"
                      aria-orientation="vertical"
                    >
                      {tabList.map((t) => (
                        <RailTile key={t.id} t={t} />
                      ))}
                      <div className="flex-1" />
                    </aside>
                  )}

                  {/* Right: keep-alive panes with wrapper cross-fade */}
                  <div
                    className="relative flex-1 min-h-0 bg-(--olivea-cream)"
                    style={{
                      contain: "layout paint size",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {preloaded &&
                      tabList.map((t) => {
                        const isActive = t.id === activeId;
                        const isPrev = t.id === prevId;

                        const wrapperStyle: React.CSSProperties = {
                          opacity: isActive ? 1 : 0,
                          visibility: "visible",
                          transition: FADE_MS
                            ? `opacity ${FADE_MS}ms cubic-bezier(.22,1,.36,1)`
                            : undefined,
                          willChange: "opacity",
                          contain: "layout paint size",
                          transform: "translateZ(0)",
                          backfaceVisibility: "hidden",
                          pointerEvents: isActive ? "auto" : "none",
                          zIndex: isActive ? 20 : isPrev ? 10 : 0,
                        };

                        return (
                          <div
                            key={t.id}
                            className="absolute inset-0"
                            style={wrapperStyle}
                            onTransitionEnd={isPrev ? handleFadeOutEnd : undefined}
                            aria-hidden={!isActive}
                          >
                            <iframe
                              src={t.url}
                              title={`Menú: ${t.label}`}
                              className="absolute inset-0 w-full h-full block"
                              style={{
                                border: 0,
                                transform: "translateZ(0)",
                                backfaceVisibility: "hidden",
                              }}
                              loading="eager"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allow="fullscreen"
                              allowFullScreen
                              tabIndex={isActive ? 0 : -1}
                            />
                          </div>
                        );
                      })}

                    {/* First open fallback before preloaded */}
                    {!preloaded && tabList.length > 0 && (
                      <div className="absolute inset-0" style={{ opacity: 1 }}>
                        <iframe
                          src={
                            tabList.find((t) => t.id === activeId)?.url ||
                            tabList[0].url
                          }
                          title="Menú en vivo"
                          className="absolute inset-0 w-full h-full block"
                          style={{
                            border: 0,
                            transform: "translateZ(0)",
                            backfaceVisibility: "hidden",
                          }}
                          loading="eager"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="fullscreen"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* MOBILE bottom bar */}
                {isMobile && tabList.length >= 2 && (
                  <div
                    className="relative flex items-center gap-2 px-2 py-2 shrink-0 cursor-grab active:cursor-grabbing border-t border-black/10 bg-white/45"
                    style={{ touchAction: "none" }}
                    onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
                      const el = e.target as HTMLElement;
                      if (el.closest('[data-no-drag="true"]')) return;
                      dragControls.start(e.nativeEvent);
                    }}
                  >
                    <button
                      data-no-drag="true"
                      onClick={closePopup}
                      aria-label="Cerrar"
                      className="p-2 rounded-full hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
                    >
                      <X size={18} />
                    </button>

                    <div
                      data-no-drag="true"
                      className="flex-1 overflow-x-auto no-scrollbar"
                    >
                      <div
                        className="flex items-center gap-6 px-2"
                        role="tablist"
                        aria-orientation="horizontal"
                      >
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
  );

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

      {/* ✅ Portal ensures it overlays navbar regardless of stacking contexts */}
      {mounted && createPortal(modal, document.body)}
    </>
  );
}