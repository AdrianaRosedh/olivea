// components/ui/popup/farmpop.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion, type Variants, type Transition } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type FarmpopProps = {
  canvaUrl: string;
  label?: string;
  title?: string;
  trigger?: ReactNode;
  triggerClassName?: string;
  autoOpenEvent?: string;
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

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const embedUrl = useMemo(
    () => (canvaUrl?.includes("?embed") ? canvaUrl : `${canvaUrl}?embed`),
    [canvaUrl]
  );

  useEffect(() => {
    if (!autoOpenEvent) return;
    const handler = () => window.setTimeout(() => setOpen(true), openDelayMs);
    window.addEventListener(autoOpenEvent, handler);
    return () => window.removeEventListener(autoOpenEvent, handler);
  }, [autoOpenEvent, openDelayMs]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openPopup  = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  // Mobile slides FROM TOP; desktop is centered
  const modalVariants: Variants = {
    hidden:  isMobile ? { y: "-100%", opacity: 0 } : { scale: 0.9, opacity: 0, filter: "blur(6px)" },
    visible: isMobile ? { y: 0,        opacity: 1 } : { scale: 1,   opacity: 1, filter: "blur(0px)" },
    exit:    isMobile ? { y: "-100%",  opacity: 0 } : { scale: 0.9, opacity: 0, filter: "blur(4px)" },
  };
  const backdropVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 220, damping: 28 }
    : { duration: 0.4, ease: "easeOut" };

  return (
    <>
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
              {/* Content box — flex column so center pane can grow */}
              <motion.div
                className={
                  (isMobile
                    ? "w-full h-[90dvh] rounded-b-2xl overflow-hidden border-b border-white/10 "
                    : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-white/10 "
                  ) +
                  "bg-[color:var(--olivea-cream)] backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col"
                }
                onClick={(e) => e.stopPropagation()}
                // MOBILE: swipe DOWN to close (handle at bottom)
                drag={isMobile ? "y" : false}
                dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
                dragElastic={isMobile ? 0.08 : undefined}
                onDragEnd={
                  isMobile
                    ? (_, info) => {
                        if (info.offset.y > 120 || info.velocity.y > 500) closePopup();
                      }
                    : undefined
                }
              >
                {/* Header (desktop); top edge of sheet (mobile) */}
                <div className={`relative flex items-center ${isMobile ? "px-4 py-3" : "px-6 py-4"} border-b flex-shrink-0`}>
                  <h2
                    className="absolute inset-0 flex items-center justify-center pointer-events-none uppercase tracking-[0.25em]"
                    style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 22 : 28, fontWeight: 200 }}
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

                {/* Content: iframe fills the remaining height */}
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

                {/* Grab handle at BOTTOM (since sheet drops from top) */}
                {isMobile && (
                  <div className="flex items-center justify-center py-2 pb-[max(0px,env(safe-area-inset-bottom))] flex-shrink-0">
                    <span className="block h-1.5 w-12 rounded-full bg-black/15" />
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