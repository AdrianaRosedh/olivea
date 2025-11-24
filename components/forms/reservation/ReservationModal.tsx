"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { motion, type Variants, type Transition } from "framer-motion";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";
import OliveaLogo from "@/assets/oliveaFTT1.svg";
import OliveaCafe from "@/assets/oliveaCafe.svg";
import { Plus_Jakarta_Sans } from "next/font/google";

// Client-only widgets (already memoized)
const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), { ssr: false });
const OpentableWidget = dynamic(() => import("./OpentableWidget"), { ssr: false });

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

/** Minimal typings for requestIdleCallback/cancelIdleCallback */
type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type RequestIdleCallback = (cb: (deadline: IdleDeadline) => void, opts?: { timeout?: number }) => number;
type CancelIdleCallback = (handle: number) => void;

function scheduleIdle(cb: () => void, timeout = 600): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & {
    requestIdleCallback?: RequestIdleCallback;
    cancelIdleCallback?: CancelIdleCallback;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(() => cb(), { timeout });
    return () => { if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id); };
  }
  const t = window.setTimeout(cb, 120);
  return () => window.clearTimeout(t);
}

interface ReservationModalProps { lang: "es" | "en" }

export default function ReservationModal({ lang }: ReservationModalProps) {
  const { isOpen, closeReservationModal, reservationType, setReservationType } = useReservation();

  // ── Mobile vs desktop
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(max-width:767px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width:767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // ── Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Pre-mount panes on first open
  const [mounted, setMounted] = useState<{ restaurant: boolean; hotel: boolean; cafe: boolean }>({
    restaurant: false, hotel: false, cafe: false,
  });
  useEffect(() => {
    if (!isOpen) return;
    setMounted(m => (m[reservationType] ? m : { ...m, [reservationType]: true }));
    const cancel = scheduleIdle(() => setMounted({ restaurant: true, hotel: true, cafe: true }), 600);
    return cancel;
  }, [isOpen, reservationType]);

  // ── Stable tab handler (keeps your API)
  const handleTabClick = useCallback(
    (id: ReservationType) => setReservationType(id),
    [setReservationType]
  );

  // ── Easing & transitions
  const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const enterT: Transition = isMobile
    ? { type: "spring", stiffness: 210, damping: 26, mass: 0.9 }   // slide up
    : { duration: 0.42, ease: EASE, delay: 0.06 };                 // fade/scale (backdrop first)
  const exitT: Transition = isMobile
    ? { type: "spring", stiffness: 210, damping: 26, mass: 0.9 }   // slide down
    : { duration: 0.42, ease: EASE };                              // mirror timing/curve

  // ── Variants (mirrorable in/out)
  const panelVariants: Variants = isMobile
    ? {
        hidden:  { y: "100%", opacity: 0 },
        visible: { y: 0,       opacity: 1, transition: enterT },
        exit:    { y: "100%",  opacity: 0, transition: exitT  },
      }
    : {
        hidden:  { scale: 0.9, opacity: 0 },
        visible: { scale: 1.0, opacity: 1, transition: enterT },
        exit:    { scale: 0.9, opacity: 0, transition: exitT  },
      };

  const backdropEnter: Transition = { duration: 0.28, ease: EASE };
  const backdropExit:  Transition = { duration: 0.28, ease: EASE };

  // ── Controlled presence: render while opening OR while animating out
  const [present, setPresent] = useState(false);
  useEffect(() => { if (isOpen) setPresent(true); }, [isOpen]);

  // Don’t render anything at all when fully closed and no exit in progress
  if (!isOpen && !present) return null;

  return (
    <>
      {/* Backdrop: cross-fades; remains mounted through exit */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        variants={{
          hidden:  { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={isOpen ? backdropEnter : backdropExit}
        aria-hidden
        onClick={closeReservationModal}
        style={{ willChange: "opacity" }}
      />

      {/* Panel: slide/fade on open; mirror on close; unmount after exit completes */}
      <motion.div
        className={`fixed inset-0 z-[1300] flex ${
          isMobile ? "items-end justify-center" : "items-center justify-center p-4"
        }`}
        style={{ willChange: "transform, opacity", contain: "layout paint style" }}
        variants={panelVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "exit"}
        onAnimationComplete={() => {
          if (!isOpen) setPresent(false); // unmount only AFTER exit finishes
        }}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "es" ? "Reservaciones" : "Reservations"}
      >
        <div
          className={`bg-[var(--olivea-cream)] flex flex-col overflow-hidden ${
            isMobile
              ? "w-full h-full rounded-none"
              : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center px-6 py-4 border-b flex-shrink-0">
            <h2
              className="absolute inset-0 flex items-center justify-center pointer-events-none uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 22 : 32, fontWeight: 200 }}
            >
              {lang === "es" ? "Reservaciones" : "Reservations"}
            </h2>
            <button
              onClick={closeReservationModal}
              aria-label={lang === "es" ? "Cerrar" : "Close"}
              className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-shrink-0 bg-[var(--olivea-cream)] px-4 md:px-0">
            {(["restaurant", "hotel", "cafe"] as ReservationType[]).map((id) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`relative flex-1 py-3 text-center uppercase tracking-[0.15em] transition-colors ${
                  reservationType === id
                    ? "text-[var(--olivea-olive)] font-semibold"
                    : "text-[var(--olivea-ink)] hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)]"
                }`}
                style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 16 : 18, fontWeight: 400 }}
                aria-current={reservationType === id ? "page" : undefined}
              >
                {id === "restaurant"
                  ? (lang === "es" ? "Restaurante" : "Restaurant")
                  : id === "hotel"
                  ? "Hotel"
                  : (lang === "es" ? "Café" : "Cafe")}
                {reservationType === id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--olivea-olive)]" />
                )}
              </button>
            ))}
          </div>

          {/* Panes (mounted once, then hidden/shown) */}
          <div className="relative flex-1 overflow-auto bg-[var(--olivea-cream)]">
            {/* HOTEL */}
            <div
              className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${
                reservationType === "hotel"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={reservationType !== "hotel"}
            >
              {mounted.hotel && (
                <div className="flex-1 flex flex-col px-0 py-0">
                  <CloudbedsWidget autoLaunch={isOpen} />
                </div>
              )}
            </div>          

            {/* RESTAURANT */}
            <div
              className={`absolute inset-0 flex flex-col transition-opacity duration-300 overflow-hidden ${
                reservationType === "restaurant"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={reservationType !== "restaurant"}
            >
              {/* Static header (pinned) */}
              <div className="flex items-center px-4 py-3 md:px-6 md:py-4 border-b shadow-md bg-[var(--olivea-cream)] sticky top-0 z-20">
                <OliveaLogo className="h-[45px] md:h-[65px]" />
                <span
                  className={`${jakarta.className} font-bold ml-5 md:ml-7 text-[var(--olivea-ink)]`}
                  style={{ fontSize: "clamp(0.9rem,2vw,1.15rem)" }}
                  id="restaurant-pane-title"
                >
                  Olivea Farm To Table
                </span>
              </div>

              {/* Scrollable content area (iframe scrolls under the header) */}
              <div
                className="flex-1 overflow-auto no-scrollbar"
                style={{ WebkitOverflowScrolling: "touch" }}
                aria-labelledby="restaurant-pane-title"
              >
                {mounted.restaurant && <OpentableWidget />}
              </div>
            </div>

            {/* CAFE */}
            <div
              className={`absolute inset-0 flex flex-col transition-opacity duration-300 overflow-auto ${
                reservationType === "cafe" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={reservationType !== "cafe"}
            >
              <div className="flex items-center px-4 py-3 md:px-6 md:py-4 border-b shadow-md bg-[var(--olivea-cream)]">
                <OliveaCafe className="h-[45px] md:h-[65px]" />
                <span className={`${jakarta.className} font-bold ml-5 md:ml-7 text-[var(--olivea-ink)]`} style={{ fontSize: "clamp(0.9rem,2vw,1.15rem)" }}>
                  Olivea Café
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center italic text-neutral-500 p-6">
                {lang === "es" ? "Próximamente disponible." : "Coming Soon."}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
