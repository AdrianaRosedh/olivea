// components/forms/reservation/ReservationModal.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  type Variants,
  type Transition,
} from "framer-motion";
import {
  useReservation,
  type ReservationType,
} from "@/contexts/ReservationContext";
import { GlassPanel } from "@/components/ui/GlassPanel";

// ← Import the correct component name here:
import { CloudbedsImmersiveIframe } from "./CloudbedsImmersiveIframe";
import { TockWidget } from "./TockWidget";

interface ReservationModalProps {
  lang: string;
}

export default function ReservationModal({ lang }: ReservationModalProps) {
  const {
    isOpen,
    openReservationModal,
    closeReservationModal,
    reservationType,
    setReservationType,
  } = useReservation();

  // detect mobile breakpoint
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // animation variants
  const variants: Variants = {
    closed: isMobile
      ? { y: "100%", opacity: 0 }
      : { scale: 0.9, opacity: 0 },
    open: isMobile ? { y: "0%", opacity: 1 } : { scale: 1, opacity: 1 },
  };
  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 200, damping: 25 }
    : { duration: 0.4, ease: "easeOut" };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeReservationModal}
          />

          {/* panel */}
          <motion.div
            className={
              `fixed inset-0 z-[1300] flex ${
                isMobile
                  ? "items-end justify-center p-0"
                  : "items-center justify-center p-4"
              } pointer-events-none`
            }
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={transition}
          >
            <GlassPanel
              className={
                `pointer-events-auto w-full ${
                  isMobile
                    ? "h-full"
                    : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl max-h-[90vh]"
                } flex flex-col overflow-hidden`
              }
            >
              {/* header */}
              <div className="relative flex items-center px-6 py-4 border-b bg-[#e8e4d5] backdrop-blur-sm flex-shrink-0 rounded-t-2xl overflow-hidden">
                {/* Centered title */}
                <h2
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-serif)",
                    fontSize: isMobile ? 24 : 32,
                    fontWeight: 200,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--olivea-ink)",
                    lineHeight: 1,
                    textAlign: "center",
                  }}
                >
                  {lang === "es" ? "Reservaciones" : "Reservations"}
                </h2>
                {/* Close button on right */}
                <button
                  onClick={closeReservationModal}
                  className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* tabs */}
              <div className="flex bg-[#e8e4d5] flex-shrink-0">
                {( ["restaurant", "hotel", "cafe"] as ReservationType[] ).map(
                  (id) => {
                    const label =
                      id === "restaurant"
                        ? lang === "es"
                          ? "Restaurante"
                          : "Restaurant"
                        : id === "hotel"
                        ? lang === "es"
                          ? "Hotel"
                          : "Hotel"
                        : lang === "es"
                        ? "Café"
                        : "Cafe";

                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setReservationType(id);
                          openReservationModal(id);
                        }}
                        className={
                          `flex-1 py-3 text-center transition-colors ${
                            reservationType === id
                              ? "border-b-4 border-[var(--olivea-olive)] text-[var(--olivea-olive)] font-semibold"
                              : "text-[var(--olivea-ink)] hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)]"
                          }`
                        }
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>

              {/* content area */}
              <div className="relative flex-1 overflow-hidden">
                <div className="relative w-full h-full p-0">
                  {reservationType === "hotel" && (
                    <CloudbedsImmersiveIframe className="absolute inset-0 w-full h-full" />
                  )}

                  {reservationType === "restaurant" && (
                    <TockWidget
                      token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJidXNpbmVzc0lkIjoiMzc0OTkiLCJ0eXBlIjoiV0lER0VUX0JVSUxERVIiLCJpYXQiOjE3NDYzMTA0NTJ9.GVNyQn2lL9yLe_U9dvRJ9gHGflQhhvoQlNiZxX5X0PM"
                      offeringId="528232"
                    />
                  )}

                  {reservationType === "cafe" && (
                    <TockWidget
                      token="YOUR_CAFE_TOKEN"
                      offeringId="YOUR_CAFE_OFFERING_ID"
                    />
                  )}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}