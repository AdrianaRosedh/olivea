// components/forms/reservation/ReservationModal.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  type WheelEventHandler,
} from "react";
import { X } from "lucide-react";
import { motion, type Variants, type Transition } from "framer-motion";
import {
  useReservation,
  type ReservationType,
} from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";
import OliveaLogo from "@/assets/oliveaFTT1.svg";
import OliveaCafe from "@/assets/oliveaCafe.svg";
import { Plus_Jakarta_Sans } from "next/font/google";

// Client-only widgets (already memoized)
const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), {
  ssr: false,
});
const OpentableWidget = dynamic(() => import("./OpentableWidget"), {
  ssr: false,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

/** Minimal typings for requestIdleCallback/cancelIdleCallback */
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

/**
 * Best-effort Lenis stop/start while modal is open.
 * Works if your Lenis instance is attached to `window.lenis`.
 * If not, this is a safe no-op.
 */
function stopLenisIfPresent() {
  const w = window as unknown as { lenis?: { stop?: () => void } };
  try {
    w.lenis?.stop?.();
  } catch {
    // no-op
  }
}
function startLenisIfPresent() {
  const w = window as unknown as { lenis?: { start?: () => void } };
  try {
    w.lenis?.start?.();
  } catch {
    // no-op
  }
}

interface ReservationModalProps {
  lang: "es" | "en";
}

export default function ReservationModal({ lang }: ReservationModalProps) {
  const {
    isOpen,
    closeReservationModal,
    reservationType,
    setReservationType,
  } = useReservation();

  // ── Mobile vs desktop
  const [isMobile, setIsMobile] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width:767px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width:767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // ── Body scroll lock + Lenis OFF while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // stop smooth-scroll (best-effort)
    stopLenisIfPresent();

    return () => {
      document.body.style.overflow = prevOverflow;
      startLenisIfPresent();
    };
  }, [isOpen]);

  // ── Full-screen hotel overlay (mobile only)
  const [showHotelOverlay, setShowHotelOverlay] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowHotelOverlay(false);
      return;
    }

    // If modal opens and we're already on HOTEL on mobile, show overlay
    if (isMobile && reservationType === "hotel") {
      setShowHotelOverlay(true);
    }
  }, [isOpen, isMobile, reservationType]);

  // ── Pre-mount panes; hotel should mount as soon as modal opens
  const [mounted, setMounted] = useState<{
    restaurant: boolean;
    hotel: boolean;
    cafe: boolean;
  }>({
    restaurant: false,
    hotel: false,
    cafe: false,
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset when modal fully closes
      setMounted({ restaurant: false, hotel: false, cafe: false });
      return;
    }

    // As soon as modal is open, always mount HOTEL immediately
    setMounted((m) => ({
      restaurant: m.restaurant || reservationType === "restaurant",
      hotel: true,
      cafe: m.cafe || reservationType === "cafe",
    }));

    // Optional: pre-mount all panes in idle time
    const cancel = scheduleIdle(
      () =>
        setMounted({
          restaurant: true,
          hotel: true,
          cafe: true,
        }),
      300
    );
    return cancel;
  }, [isOpen, reservationType]);

  // ── Tab handler
  const handleTabClick = useCallback(
    (id: ReservationType) => {
      setReservationType(id);

      // On mobile, switching to HOTEL opens full-screen overlay
      if (isMobile && id === "hotel") {
        setShowHotelOverlay(true);
      }
    },
    [isMobile, setReservationType]
  );

  // ── Easing & transitions
  const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const enterT: Transition = isMobile
    ? { type: "spring", stiffness: 210, damping: 26, mass: 0.9 }
    : { duration: 0.42, ease: EASE, delay: 0.06 };
  const exitT: Transition = isMobile
    ? { type: "spring", stiffness: 210, damping: 26, mass: 0.9 }
    : { duration: 0.42, ease: EASE };

  const panelVariants: Variants = isMobile
    ? {
        hidden: { y: "100%", opacity: 0 },
        visible: { y: 0, opacity: 1, transition: enterT },
        exit: { y: "100%", opacity: 0, transition: exitT },
      }
    : {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1.0, opacity: 1, transition: enterT },
        exit: { scale: 0.9, opacity: 0, transition: exitT },
      };

  const backdropEnter: Transition = { duration: 0.28, ease: EASE };
  const backdropExit: Transition = { duration: 0.28, ease: EASE };

  // ── Controlled presence
  const [present, setPresent] = useState(false);
  useEffect(() => {
    if (isOpen) setPresent(true);
  }, [isOpen]);

  // ── Stop scroll bubbling up to window (desktop wheel only)
  const stopWheelPropagation: WheelEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  if (!isOpen && !present) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1200"
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={isOpen ? backdropEnter : backdropExit}
        aria-hidden
        onClick={closeReservationModal}
        style={{ willChange: "opacity" }}
      />

      {/* Panel */}
      <motion.div
        className={`fixed inset-0 z-1300 flex ${
          isMobile ? "items-end justify-center" : "items-center justify-center p-4"
        }`}
        style={{
          willChange: "transform, opacity",
          contain: "layout paint style",
        }}
        variants={panelVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "exit"}
        onAnimationComplete={() => {
          if (!isOpen) setPresent(false);
        }}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "es" ? "Reservaciones" : "Reservations"}
      >
        <div
          className={`bg-(--olivea-cream) flex flex-col overflow-hidden ${
            isMobile
              ? "w-full h-full rounded-none"
              : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center px-6 py-4 shrink-0">
            <h2
              className="absolute inset-0 flex items-center justify-center pointer-events-none uppercase tracking-[0.25em]"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: isMobile ? 22 : 32,
                fontWeight: 200,
              }}
            >
              {lang === "es" ? "Reservaciones" : "Reservations"}
            </h2>
            <button
              onClick={closeReservationModal}
              aria-label={lang === "es" ? "Cerrar" : "Close"}
              className="ml-auto p-2 rounded-full hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 bg-(--olivea-cream) px-4 md:px-0">
            {(["restaurant", "hotel", "cafe"] as ReservationType[]).map((id) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`relative flex-1 py-3 text-center uppercase tracking-[0.15em] transition-colors ${
                  reservationType === id
                    ? "text-(--olivea-olive) font-semibold"
                    : "text-(--olivea-ink) hover:bg-(--olivea-olive) hover:text-(--olivea-cream)"
                }`}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 400,
                }}
                aria-current={reservationType === id ? "page" : undefined}
              >
                {id === "restaurant"
                  ? lang === "es"
                    ? "Restaurante"
                    : "Restaurant"
                  : id === "hotel"
                  ? "Hotel"
                  : lang === "es"
                  ? "Café"
                  : "Cafe"}
                {reservationType === id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-(--olivea-olive)" />
                )}
              </button>
            ))}
          </div>

          {/* Panes */}
          <div className="flex-1 min-h-0 flex flex-col bg-(--olivea-cream)">
            {/* HOTEL */}
            <div
              className={`flex-1 min-h-0 flex flex-col ${
                reservationType === "hotel" ? "flex" : "hidden"
              }`}
              aria-hidden={reservationType !== "hotel"}
            >
              {mounted.hotel && (
                <>
                  {isMobile && (
                    <div className="px-4 py-3 md:px-6 md:py-4 bg-(--olivea-cream) shrink-0">
                      <span
                        className={`${jakarta.className} font-semibold text-(--olivea-ink) tracking-[0.15em] uppercase`}
                        style={{ fontSize: "clamp(0.8rem,1.8vw,1rem)" }}
                        id="hotel-pane-title"
                      >
                        Casa Olivea — Reservaciones
                      </span>
                    </div>
                  )}

                  <div
                    className="flex-1 min-h-0 overflow-hidden"
                    aria-labelledby="hotel-pane-title"
                  >
                    {isMobile ? (
                      <div className="px-4 pt-6 pb-10 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowHotelOverlay(true)}
                          className="w-full max-w-md rounded-2xl border border-(--olivea-olive)/30 bg-(--olivea-cream)/80 px-4 py-5 text-left shadow-sm active:scale-[0.99] transition-transform"
                        >
                          <p className="text-xs uppercase tracking-[0.18em] text-(--olivea-ink)/70 mb-2">
                            Motor de reservaciones
                          </p>
                          <p className="text-sm font-medium text-(--olivea-ink) mb-1">
                            Gestiona tu reserva de Casa Olivea
                          </p>
                          <p className="text-xs text-(--olivea-ink)/70 mb-3">
                            Toca para abrir el motor seguro de Cloudbeds en
                            pantalla completa.
                          </p>
                          <span className="text-xs font-semibold underline underline-offset-4">
                            Abrir en pantalla completa
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-full">
                        <CloudbedsWidget lang={lang} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* RESTAURANT (OpenTable) */}
            <div
              className={`flex-1 min-h-0 flex flex-col ${
                reservationType === "restaurant" ? "flex" : "hidden"
              }`}
              aria-hidden={reservationType !== "restaurant"}
            >
              {!isMobile && (
                <div className="flex items-center px-4 py-3 md:px-6 md:py-4 bg-(--olivea-cream) shrink-0">
                  <OliveaLogo className="h-11.25 md:h-16.25" />
                  <span
                    className={`${jakarta.className} font-bold ml-5 md:ml-7 text-(--olivea-ink)`}
                    style={{ fontSize: "clamp(0.9rem,2vw,1.15rem)" }}
                    id="restaurant-pane-title"
                  >
                    Olivea Farm To Table
                  </span>
                </div>
              )}

              {/* IMPORTANT: do NOT make parent scrollable; iframe must receive touch */}
              <div
                className="flex-1 min-h-0 overflow-hidden"
                aria-labelledby="restaurant-pane-title"
                onWheelCapture={stopWheelPropagation}
              >
                {mounted.restaurant && <OpentableWidget />}
              </div>
            </div>

            {/* CAFE */}
            <div
              className={`flex-1 min-h-0 flex flex-col ${
                reservationType === "cafe" ? "flex" : "hidden"
              }`}
              aria-hidden={reservationType !== "cafe"}
            >
              {!isMobile && (
                <div className="flex items-center px-4 py-3 md:px-6 md:py-4 bg-(--olivea-cream) shrink-0">
                  <OliveaCafe className="h-11.25 md:h-16.25" />
                  <span
                    className={`${jakarta.className} font-bold ml-5 md:ml-7 text-(--olivea-ink)`}
                    style={{ fontSize: "clamp(0.9rem,2vw,1.15rem)" }}
                  >
                    Olivea Café
                  </span>
                </div>
              )}

              <div className="flex-1 flex items-center justify-center italic text-neutral-500 p-6">
                {lang === "es" ? "Próximamente disponible." : "Coming Soon."}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MOBILE FULL-SCREEN HOTEL SHEET */}
      {isMobile && mounted.hotel && (
        <div
          className={`fixed inset-0 z-1400 bg-(--olivea-cream) flex flex-col transition-opacity duration-300 ${
            showHotelOverlay
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center px-4 py-3 bg-(--olivea-cream)">
            <span className="flex-1 text-center text-xs uppercase tracking-[0.18em] text-(--olivea-ink)/80">
              Casa Olivea — Reservaciones
            </span>
            <button
              type="button"
              onClick={() => setShowHotelOverlay(false)}
              aria-label="Cerrar"
              className="ml-3 w-9 h-9 flex items-center justify-center rounded-full bg-(--olivea-olive) text-(--olivea-cream) shadow-sm active:scale-95 transition-all"
            >
              <X size={20} strokeWidth={1.6} />
            </button>
          </div>

          <div
            className="w-full h-[calc(100%-44px)] overflow-auto no-scrollbar"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              touchAction: "pan-y",
            }}
            onWheelCapture={stopWheelPropagation}
          >
            <CloudbedsWidget lang={lang} />
          </div>
        </div>
      )}
    </>
  );
}