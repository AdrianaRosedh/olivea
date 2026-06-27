"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate,
  type PanInfo,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";

// Web Component types declared in types/roseiies.d.ts

// ─── Animation config ───────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

// ── Draggable orb config ────────────────────────────────────────────
// Responsive: slightly smaller orb on phones; more edge padding on desktop so
// it doesn't sit flush against the screen edge.
function orbDims(vw: number) {
  const mobile = vw < 768;
  return { size: mobile ? 48 : 56, edge: mobile ? 16 : 32 };
}
const ORB_TOP_MARGIN = 64; // keep clear of the header
const ORB_BOTTOM_MARGIN = 28; // keep clear of the bottom
const ORB_STORAGE_KEY = "olivea:livegarden:orb:v1";

type OrbSide = "left" | "right";
const clampN = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

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
  // Hide on individual team bio pages (/[lang]/team/{name}); the index keeps it.
  const isTeamMember = useMemo(() => pathname?.includes("/team/") ?? false, [pathname]);

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

  // ── Draggable orb (chat-head style: drag → fling → snap to edge → remember) ──
  const orbX = useMotionValue(0);
  const orbY = useMotionValue(0);
  const [orbSide, setOrbSide] = useState<OrbSide>("right");
  const [orbReady, setOrbReady] = useState(false);
  const [orbHover, setOrbHover] = useState(false);
  const [orbDragging, setOrbDragging] = useState(false);
  const [orbSize, setOrbSize] = useState(56);
  const orbMovedRef = useRef(false);

  const placeOrb = useCallback(
    (s: OrbSide, yy: number, withAnim: boolean) => {
      if (typeof window === "undefined") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { size, edge } = orbDims(vw);
      const targetX = s === "right" ? vw - size - edge : edge;
      orbY.set(clampN(yy, ORB_TOP_MARGIN, vh - size - ORB_BOTTOM_MARGIN));
      if (withAnim && !prefersReduced) {
        animate(orbX, targetX, {
          type: "spring",
          stiffness: 520,
          damping: 38,
          mass: 0.9,
        });
      } else {
        orbX.set(targetX);
      }
    },
    [prefersReduced, orbX, orbY],
  );

  // Restore saved position on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    let s: OrbSide = "right";
    let yy = window.innerHeight * 0.18;
    try {
      const raw = localStorage.getItem(ORB_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { side?: OrbSide; yRatio?: number };
        if (saved.side === "left" || saved.side === "right") s = saved.side;
        if (typeof saved.yRatio === "number")
          yy = saved.yRatio * window.innerHeight;
      }
    } catch {
      /* ignore bad storage */
    }
    setOrbSide(s);
    setOrbSize(orbDims(window.innerWidth).size);
    placeOrb(s, yy, false);
    setOrbReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep it on-screen across resize / orientation / viewport changes
  useEffect(() => {
    const onResize = () => {
      setOrbSize(orbDims(window.innerWidth).size);
      placeOrb(orbSide, orbY.get(), false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [orbSide, placeOrb, orbY]);

  const handleOrbDragStart = useCallback(() => {
    orbMovedRef.current = true;
    setOrbDragging(true);
  }, []);

  const handleOrbDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setOrbDragging(false);
      const vw = window.innerWidth;
      const center = orbX.get() + orbDims(vw).size / 2 + info.velocity.x * 0.04;
      const s: OrbSide = center > vw / 2 ? "right" : "left";
      setOrbSide(s);
      placeOrb(s, orbY.get(), true);
      try {
        localStorage.setItem(
          ORB_STORAGE_KEY,
          JSON.stringify({ side: s, yRatio: orbY.get() / window.innerHeight }),
        );
      } catch {
        /* ignore */
      }
      // Reset the drag flag just after the trailing click is swallowed
      window.setTimeout(() => {
        orbMovedRef.current = false;
      }, 60);
    },
    [orbX, orbY, placeOrb],
  );

  const handleOrbClick = useCallback(() => {
    if (orbMovedRef.current) {
      orbMovedRef.current = false;
      return; // it was a drag, not a tap
    }
    open();
  }, [open]);

  const panel = prefersReduced
    ? panelReduced
    : isMobile
      ? panelMobile
      : panelDesktop;

  // Don't render on admin pages or individual team bio pages
  if (isAdmin || isTeamMember) return null;

  return (
    <>
      {/* Inject pulse animation */}
      <style dangerouslySetInnerHTML={{ __html: pulseKeyframes }} />

      {/* ─── Draggable roseiies live-map orb ─────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="live-orb"
            drag
            dragMomentum={false}
            onDragStart={handleOrbDragStart}
            onDragEnd={handleOrbDragEnd}
            onHoverStart={() => setOrbHover(true)}
            onHoverEnd={() => setOrbHover(false)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: orbReady ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            whileDrag={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            style={{
              x: orbX,
              y: orbY,
              width: orbSize,
              height: orbSize,
              touchAction: "none",
            }}
            className={cn(
              "fixed left-0 top-0 z-9999",
              "cursor-grab active:cursor-grabbing select-none",
            )}
          >
            <button
              type="button"
              onClick={handleOrbClick}
              aria-label={isEn ? "See what's growing in the garden right now" : "Vean qué crece en el huerto ahora mismo"}
              className={cn(
                "relative grid place-items-center w-full h-full rounded-full outline-none",
                "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/45 focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-cream)",
              )}
            >
              {/* lift shadow (grows while dragging) */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full transition-shadow duration-200"
                style={{
                  boxShadow: orbDragging
                    ? "0 26px 50px -14px rgba(0,0,0,0.5)"
                    : "0 14px 34px -16px rgba(0,0,0,0.45)",
                }}
              />
              {/* roseiies orb (the woggle) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/roseiies-mark.svg"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="relative w-full h-full rounded-full ring-1 ring-white/45 pointer-events-none"
              />
              {/* live badge */}
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span
                  className="absolute inset-0 rounded-full bg-green-400"
                  style={{ animation: "live-pulse 2s ease-out infinite" }}
                />
                <span className="relative h-3 w-3 rounded-full bg-green-400 ring-2 ring-(--olivea-cream)" />
              </span>
            </button>

            {/* Desktop hover label (sits on the side opposite the snapped edge) */}
            <AnimatePresence>
              {orbHover && !orbDragging && (
                <motion.span
                  key="orb-label"
                  initial={{ opacity: 0, x: orbSide === "right" ? 8 : -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: orbSide === "right" ? 8 : -8 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className={cn(
                    "hidden md:block pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap",
                    "px-3 py-1.5 rounded-full bg-(--olivea-olive) text-(--olivea-cream)",
                    "text-[10px] font-semibold tracking-widest uppercase",
                    "shadow-[0_14px_34px_-20px_rgba(0,0,0,0.55)]",
                    orbSide === "right" ? "right-full mr-3" : "left-full ml-3",
                  )}
                >
                  {isEn ? "See What's Growing" : "Vean Qué Crece Hoy"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
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
