// components/ui/popup/farmpop.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type Variants,
  type Transition,
} from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type MenuTab = { id: string; label: string; url: string; emoji?: string; icon?: ReactNode };

type FarmpopProps = {
  canvaUrl?: string;              // single Canva url (ignored if tabs provided)
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
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 767px)").matches
  );

  // --- active tab ---
  const [activeId, setActiveId] = useState<string>(() => {
    if (tabs && tabs.length) {
      return initialTabId && tabs.some((t) => t.id === initialTabId) ? initialTabId : tabs[0].id;
    }
    return "single";
  });

  // --- responsive flag ---
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // --- URL to embed ---
  const embedUrl = useMemo(() => {
    if (tabs && tabs.length) {
      const t = tabs.find((x) => x.id === activeId) ?? tabs[0];
      const url = t?.url || "";
      return url.includes("?embed") ? url : `${url}?embed`;
    }
    const single = canvaUrl || "";
    return single.includes("?embed") ? single : `${single}?embed`;
  }, [tabs, activeId, canvaUrl]);

  // --- auto-open from hero ---
  useEffect(() => {
    if (!autoOpenEvent) return;
    const handler = () => window.setTimeout(() => setOpen(true), openDelayMs);
    window.addEventListener(autoOpenEvent, handler);
    return () => window.removeEventListener(autoOpenEvent, handler);
  }, [autoOpenEvent, openDelayMs]);

  // --- lock body scroll while open ---
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // --- close on ESC ---
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // inside components/ui/popup/farmpop.tsx
  useEffect(() => {
    if (typeof window === "undefined") return;
  
    const shouldOpen = sessionStorage.getItem("olivea:autoopen-menu") === "1";
    const atMenuHash = window.location.hash === "#menu";
  
    if (shouldOpen && atMenuHash) {
      sessionStorage.removeItem("olivea:autoopen-menu");
    
      // optional: restore a requested tab
      const savedTab = sessionStorage.getItem("olivea:autoopen-tab");
      if (savedTab && tabs?.some(t => t.id === savedTab)) {
        setActiveId(savedTab);
      }
      sessionStorage.removeItem("olivea:autoopen-tab");
    
      // wait a moment so the page finishes scrolling to #menu
      const t = window.setTimeout(() => setOpen(true), openDelayMs + 150);
      return () => window.clearTimeout(t);
    }
  }, [tabs, openDelayMs]);

  const openPopup  = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  // --- motion variants ---
  // Desktop exactly like Reservation; Mobile unchanged
  const modalVariants: Variants = {
    hidden:  isMobile ? { y: "-100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
    visible: isMobile ? { y: 0,        opacity: 1 } : { scale: 1,   opacity: 1 },
    exit:    isMobile ? { y: "-100%",  opacity: 0 } : { scale: 0.9, opacity: 0 },
  };

  const backdropVariants: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
    exit:    { opacity: 0 },
  };

  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 200, damping: 25 } // keep mobile feel
    : { duration: 0.4, ease: "easeOut" };  

  const contentVariants: Variants = {
    hidden:  isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    visible: isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
    exit:    isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 },
  };
  const contentTransition: Transition = isMobile
    ? { duration: 0 }                    // no change on mobile
    : { duration: 0.25, ease: "easeOut", delay: 0.06 }; // starts with panel

  // --- mobile drag: upward only to close ---
  const dragControls = useDragControls(); // ← used by panel and started from bottom bar
  const CLOSE_PX = 140;                   // distance required to close
  const CLOSE_VELOCITY = -600;            // upward flick threshold (velocity.y is negative upward)

  // --- glyphs for tabs (emoji fallback) ---
  const tabGlyph = (t: MenuTab): ReactNode => {
    if (t.icon) return t.icon;
    if (t.emoji) return <span className="text-[16px] leading-none">{t.emoji}</span>;
    const map: Record<string, string> = { menu: "🍽️", licores: "🥃", vinos: "🍷", bebidas: "🍹" };
    return <span className="text-[16px] leading-none">{map[t.id] ?? "📄"}</span>;
  };

  // --- desktop rail tile ---
  const RailTile = ({ t }: { t: MenuTab }) => {
    const active = activeId === t.id;
    return (
      <button
        role="tab"
        aria-selected={active}
        onClick={() => setActiveId(t.id)}
        className={[
          "group w-full rounded-xl transition-all text-left ring-1 ring-white/20",
          active
            ? "bg-[var(--olivea-olive)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
            : "bg-white/50 text-[var(--olivea-ink)]/90 hover:bg-white/70",
        ].join(" ")}
        style={{ height: 72 }} // fills your desktop rail “box”
      >
        <div className="h-full px-4 flex items-center gap-3">
          <span
            className={[
              "h-10 w-[3px] rounded-full",
              active ? "bg-white" : "bg-transparent group-hover:bg-black/20",
            ].join(" ")}
          />
          <div className="flex items-center gap-2">
            <span aria-hidden>{tabGlyph(t)}</span>
            <span className="text-[12.5px] uppercase tracking-[0.18em]">{t.label}</span>
          </div>
        </div>
      </button>
    );
  };

// mobile chip (no icons on mobile to keep width compact)
  const Chip = ({ t }: { t: MenuTab }) => {
    const active = activeId === t.id;
    return (
      <button
        data-no-drag="true"
        role="tab"
        aria-selected={active}
        onClick={() => setActiveId(t.id)}
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
            {/* Backdrop */}
            <motion.div
              key="farmpop-backdrop"
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }} 
              onClick={closePopup}
            />

            {/* Panel container */}
            <motion.div
              key={`farmpop-panel-${isMobile ? "m" : "d"}`}
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
                  "bg-[color:var(--olivea-cream)] backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col"
                }
                onClick={(e) => e.stopPropagation()}
                // mobile drag — upward only to close (use controls started from bottom bar)
                drag={isMobile ? "y" : false}
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={isMobile ? { top: -CLOSE_PX, bottom: 0 } : undefined}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={
                  isMobile
                    ? (_, info) => {
                        if (info.offset.y < -(CLOSE_PX * 0.6) || info.velocity.y < CLOSE_VELOCITY) {
                          setOpen(false);
                        }
                      }
                    : undefined
                }
              >
                <motion.div
                  className="flex h-full w-full flex-col"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={contentTransition}
                >
                  {/* Desktop header at TOP */}
                  {!isMobile && (
                    <div className="relative flex items-center px-6 py-4 border-b border-white/20 flex-shrink-0 bg-[color:var(--olivea-cream)]/96">
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

                  {/* CONTENT — two-column on desktop; single column on mobile */}
                  <div className="flex-1 min-h-0 bg-[color:var(--olivea-cream)] flex">
                    {/* Desktop left rail — full-height tiles */}
                    {!isMobile && (tabs?.length ?? 0) >= 2 && (
                      <aside
                        className="
                          hidden md:flex flex-col shrink-0 w-[260px]
                          bg-[color:var(--olivea-cream)]/96 border-r border-white/20
                          px-4 py-4 gap-3
                        "
                        role="tablist"
                        aria-orientation="vertical"
                      >
                        {tabs!.map((t) => (
                          <RailTile key={t.id} t={t} />
                        ))}
                        <div className="flex-1" />
                      </aside>
                    )}

                    {/* Right: iframe fills remaining space */}
                    <div className="flex-1 min-h-0 bg-[color:var(--olivea-cream)]">
                      <iframe
                        key={embedUrl}
                        src={embedUrl}
                        title="Menú en vivo"
                        className="w-full h-full block"
                        style={{ border: 0 }}
                        loading="lazy"
                        allow="fullscreen"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>

                  {/* MOBILE bottom bar — grab zone + X + scrollable chips + pill */}
                  {isMobile && (
                    <div
                      className="relative flex items-center gap-2 px-2 py-2 border-t border-white/20 flex-shrink-0 cursor-grab active:cursor-grabbing bg-white/40"
                      style={{ touchAction: "none" }}
                      onPointerDown={(e) => {
                        const t = e.target as HTMLElement;
                        if (t.closest('[data-no-drag="true"]')) return;
                        dragControls.start(e.nativeEvent as PointerEvent); // ← uses the controls defined above
                      }}
                    >
                      {/* X on the left */}
                      <button
                        data-no-drag="true"
                        onClick={closePopup}
                        aria-label="Cerrar"
                        className="p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors"
                      >
                        <X size={18} />
                      </button>

                      {/* Tabs strip */}
                      {(tabs?.length ?? 0) >= 2 && (
                        <div data-no-drag="true" className="flex-1 overflow-x-auto no-scrollbar">
                          <div className="flex items-center gap-6 px-2" role="tablist" aria-orientation="horizontal">
                            {tabs!.map((t) => (
                              <Chip key={t.id} t={t} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Center drag pill */}
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