"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";

// Web Component types declared in types/roseiies.d.ts

// ─── Animation config ───────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE_IN_OUT } },
};

const panelDesktop = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2, ease: EASE_IN_OUT },
  },
};

const panelMobile = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring" as const, damping: 30, stiffness: 300, mass: 0.8 },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.25, ease: EASE_IN_OUT },
  },
};

const panelReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

// ─── Pulse CSS ──────────────────────────────────────────────────────

const pulseKeyframes = `
@keyframes live-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
`;

// ─── Map container (iframe embed) ───────────────────────────────────

function MapContainer({ isEn }: { isEn: boolean }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex-1 relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <svg
              className="animate-spin h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
            <span className="text-sm tracking-wide">
              {isEn ? "Loading map..." : "Cargando mapa..."}
            </span>
          </div>
        </div>
      )}
      <iframe
        src="https://roseiies.com/r/olivea/map/live?embed=frame"
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0"
        title={isEn ? "Olivea Live Garden Map" : "Mapa en vivo del huerto Olivea"}
      />
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────

export default function LiveGarden() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReduced = useReducedMotion();
  const pathname = usePathname();
  const isEn = useMemo(() => pathname?.startsWith("/en") ?? false, [pathname]);
  const isAdmin = useMemo(() => pathname?.startsWith("/admin") ?? false, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setModalOpen(true);
    lockBodyScroll();
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setModalOpen(false);
    unlockBodyScroll();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Allow external open (e.g. mobile dock)
  useEffect(() => {
    const handler = () => open();
    window.addEventListener("olivea:live-garden", handler);
    return () => window.removeEventListener("olivea:live-garden", handler);
  }, [open]);

  const panel = prefersReduced
    ? panelReduced
    : isMobile
      ? panelMobile
      : panelDesktop;

  // Don't render on admin pages
  if (isAdmin) return null;

  return (
    <>
      {/* Inject pulse animation */}
      <style dangerouslySetInnerHTML={{ __html: pulseKeyframes }} />

      {/* ─── Floating Button ─────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="live-btn"
            onClick={open}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className={cn(
              "fixed z-9999 flex items-center gap-2",
              "hidden md:flex",
              "px-3.5 py-2 rounded-full",
              "bg-(--olivea-olive) hover:bg-(--olivea-clay) text-(--olivea-cream)",
              "shadow-[0_18px_44px_-28px_rgba(0,0,0,0.6)]",
              "hover:scale-105 active:scale-95",
              "transition-[colors,transform] duration-200",
              "cursor-pointer select-none",
              // Top-right, directly below RESERVAR button
              "top-35 right-10.5",
            )}
            aria-label={isEn ? "See what's growing in the garden right now" : "Vean qué crece en el huerto ahora mismo"}
          >
            {/* Pulse dot */}
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inset-0 rounded-full bg-green-400"
                style={{ animation: "live-pulse 2s ease-out infinite" }}
              />
              <span className="relative rounded-full h-2 w-2 bg-green-400" />
            </span>

            <span className="text-[10px] font-semibold tracking-widest uppercase">
              {isEn ? "See What's Growing" : "Vean Qué Crece Hoy"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Full-screen Overlay ──────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="live-backdrop"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={close}
              className="fixed inset-0 z-1500 bg-black/60 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
              key="live-panel"
              variants={panel}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={cn(
                "fixed z-1501 flex flex-col",
                // Mobile: full screen
                "inset-0",
                // Desktop: centered with margin + rounded corners
                "md:inset-4 md:rounded-2xl md:overflow-hidden",
              )}
              style={{ backgroundColor: "#d4cfc4" }}
            >
              {/* ─── Header ─────────────────────────────────── */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 md:px-6">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inset-0 rounded-full bg-green-400"
                      style={{ animation: "live-pulse 2s ease-out infinite" }}
                    />
                    <span className="relative rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <h2 className="text-sm md:text-base font-medium tracking-wide uppercase" style={{ color: "var(--olivea-olive)" }}>
                    {isEn ? "Olivea — Live" : "Olivea — En Vivo"}
                  </h2>
                </div>

                <button
                  onClick={close}
                  className={cn(
                    "flex items-center justify-center",
                    "w-10 h-10 rounded-full",
                    "bg-(--olivea-olive)/10 hover:bg-(--olivea-olive)/20",
                    "transition-colors duration-150",
                    "cursor-pointer",
                  )}
                  style={{ color: "var(--olivea-olive)" }}
                  aria-label={isEn ? "Close map" : "Cerrar mapa"}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4l10 10M14 4L4 14" />
                  </svg>
                </button>
              </div>

              {/* ─── Subtitle ──────────────────────────────── */}
              <p className="px-5 pb-3 md:px-6 text-xs tracking-wide" style={{ color: "var(--olivea-olive)", opacity: 0.7 }}>
                {isEn
                  ? "Explore our property and discover what\u2019s growing in the garden right now."
                  : "Explora nuestra propiedad y descubre qu\u00e9 crece en el huerto ahora mismo."}
              </p>

              {/* ─── Map ────────────────────────────────────── */}
              <MapContainer isEn={isEn} />


              {/* ─── Footer: Powered by Roseiies ────────────── */}
              <div className="flex items-center justify-center px-5 py-3 md:py-4">
                <a
                  href="https://roseiies.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
                >
                  <span className="text-xs tracking-wide text-neutral-500">
                    {isEn ? "Powered by" : "Hecho con"}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/roseiies-logo.svg"
                    alt="Roseiies"
                    className="h-3.5 w-auto"
                  />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
