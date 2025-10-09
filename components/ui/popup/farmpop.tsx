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

  // NEW: mobile drag bounds (how far up the sheet can travel)
  const [dragBounds, setDragBounds] = useState<{ top: number; bottom: number }>({ top: -600, bottom: 0 });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // compute a generous upward drag range (~80% of viewport)
  useEffect(() => {
    if (!isMobile) return;
    const onResize = () => {
      const h = window.innerHeight || 800;
      setDragBounds({ top: -Math.round(h * 0.8), bottom: 0 });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile]);

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

  const modalVariants: Variants = {
    hidden:  isMobile ? { y: "-100%", opacity: 0 } : { scale: 0.9, opacity: 0, filter: "blur(6px)" },
    visible: isMobile ? { y: 0,        opacity: 1 } : { scale: 1,   opacity: 1, filter: "blur(0px)" },
    exit:    isMobile ? { y: "-100%",  opacity: 0 } : { scale: 0.9, opacity: 0, filter: "blur(4px)" },
  };
  const backdropVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 220, damping: 28 }
    : { duration: 0.4, ease: "easeOut" };

  // Only the handle should start the drag so iframe remains fully interactive
  const dragControls = useDragControls();

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
              <motion.div
                className={
                  (isMobile
                    ? "w-full h-[90dvh] rounded-b-2xl overflow-hidden border-b border-white/10 "
                    : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-white/10 "
                  ) +
                  "bg-[color:var(--olivea-cream)] backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col"
                }
                onClick={(e) => e.stopPropagation()}
                drag={isMobile ? "y" : false}
                dragListener={false}
                dragControls={dragControls}
                dragConstraints={isMobile ? dragBounds : undefined}
                dragElastic={isMobile ? 0.1 : undefined}
                onDragEnd={
                  isMobile
                    ? (_, info) => {
                        // CLOSE ON UPWARD swipe: offset.y negative when dragging up
                        if (info.offset.y < -120 || info.velocity.y < -600) closePopup();
                      }
                    : undefined
                }
              >
                {/* Desktop top header (unchanged) */}
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

                {/* Content */}
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

                {/* MOBILE bottom bar: handle only (no X) */}
                {isMobile && (
                  <div className="relative flex items-center justify-center py-3 border-t flex-shrink-0">
                    {/* The handle starts the controlled drag */}
                    <button
                      aria-label="Drag to close"
                      className="h-1.5 w-12 rounded-full bg-black/15 cursor-grab active:cursor-grabbing"
                      style={{ touchAction: "none" }}
                      onPointerDown={(e) => dragControls.start(e.nativeEvent as PointerEvent)}
                    />
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
