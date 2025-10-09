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

type FarmpopProps = {
  canvaUrl: string;
  label?: string;
  title?: string;                // desktop header title (mobile bar has no title)
  trigger?: ReactNode;
  triggerClassName?: string;
  autoOpenEvent?: string;       // event name from hero to auto-open
  openDelayMs?: number;
};

export default function Farmpop({
  canvaUrl,
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

  // keep mobile/desktop flag updated
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // normalize Canva URL (must be public view + ?embed)
  const embedUrl = useMemo(
    () => (canvaUrl?.includes("?embed") ? canvaUrl : `${canvaUrl}?embed`),
    [canvaUrl]
  );

  // auto-open after hero scroll
  useEffect(() => {
    if (!autoOpenEvent) return;
    const handler = () => window.setTimeout(() => setOpen(true), openDelayMs);
    window.addEventListener(autoOpenEvent, handler);
    return () => window.removeEventListener(autoOpenEvent, handler);
  }, [autoOpenEvent, openDelayMs]);

  // lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openPopup = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  // motion variants: mobile sheet drops FROM TOP, desktop scales in center
  const modalVariants: Variants = {
    hidden:  isMobile ? { y: "-100%", opacity: 0 } : { scale: 0.9, opacity: 0, filter: "blur(6px)" },
    visible: isMobile ? { y: 0,        opacity: 1 } : { scale: 1,   opacity: 1, filter: "blur(0px)" },
    exit:    isMobile ? { y: "-100%",  opacity: 0 } : { scale: 0.9, opacity: 0, filter: "blur(4px)" },
  };
  const backdropVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 220, damping: 28 }
    : { duration: 0.4, ease: "easeOut" };

  // --- mobile drag: only allow UPWARD closes (no downward travel) ---
  const dragControls = useDragControls();
  const CLOSE_PX = 140;          // required upward distance to close
  const CLOSE_VELOCITY = -600;   // fast upward flick closes (negative y)

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
            {/* Backdrop (tap to close) */}
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
              className={`fixed inset-0 z-[1300] flex ${
                isMobile ? "items-start justify-center" : "items-center justify-center p-4"
              }`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
            >
              {/* Content panel (flex column so iframe grows) */}
              <motion.div
                className={
                  (isMobile
                    ? "w-full h-[90dvh] rounded-b-2xl overflow-hidden border-b border-white/10 "
                    : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-white/10 "
                  ) +
                  "bg-[color:var(--olivea-cream)] backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col"
                }
                onClick={(e) => e.stopPropagation()} // keep clicks inside from closing
                drag={isMobile ? "y" : false}
                dragControls={dragControls}
                dragListener={false}                         // only the bottom bar starts the drag
                dragConstraints={isMobile ? { top: -CLOSE_PX, bottom: 0 } : undefined}
                dragElastic={0}                              // no rubberband
                dragMomentum={false}                         // no inertia
                onDragEnd={
                  isMobile
                    ? (_, info) => {
                        // close only on UPWARD intent (negative offset/velocity)
                        if (info.offset.y < -CLOSE_PX * 0.6 || info.velocity.y < CLOSE_VELOCITY) {
                          closePopup();
                        }
                      }
                    : undefined
                }
              >
                {/* Desktop header at TOP (unchanged) */}
                {!isMobile && (
                  <div className="relative flex items-center px-6 py-4 border-b flex-shrink-0">
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

                {/* Content — iframe fills remaining height */}
                <div className="flex-1 min-h-0 bg-[var(--olivea-cream)]">
                  <iframe
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

                {/* MOBILE bottom bar — full grab zone + X on the LEFT; no title */}
                {isMobile && (
                  <div
                    className="relative flex items-center justify-between px-3 py-3 border-t flex-shrink-0 cursor-grab active:cursor-grabbing"
                    style={{ touchAction: "none" }}
                    onPointerDown={(e) => {
                      const t = e.target as HTMLElement;
                      if (t.closest('[data-no-drag="true"]')) return; // don’t start drag on the X
                      dragControls.start(e.nativeEvent as PointerEvent);
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

                    {/* Centered pill inside the bar */}
                    <span className="absolute left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-black/15" />

                    {/* reserve space on the right for future tabs/actions */}
                    <span className="w-9" />
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}