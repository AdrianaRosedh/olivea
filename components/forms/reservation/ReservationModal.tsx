// components/forms/reservation/ReservationModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import { useReservation, ReservationType } from "@/contexts/ReservationContext";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface ReservationModalProps {
  lang: string;
}

export default function ReservationModal({ lang }: ReservationModalProps) {
  const {
    isOpen,
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

  // animation variants for slide-up on mobile, scale-in on desktop
  const variants: Variants = {
    closed: isMobile
      ? { y: "100%", opacity: 0 }
      : { scale: 0.9, opacity: 0 },
    open: isMobile
      ? { y: "0%", opacity: 1 }
      : { scale: 1, opacity: 1 },
  };
  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 200, damping: 25 }
    : { duration: 0.4, ease: "easeOut" };

  // restaurant / café iframe URLs
  const iframeUrl =
    reservationType === "restaurant"
      ? "https://www.exploretock.com/yourrestaurant/embed"
      : reservationType === "cafe"
      ? "https://your-cafe-reservation-system.com/embed"
      : "";

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
            className={`
              fixed inset-0 z-[1300] flex
              ${isMobile ? "items-end justify-center p-0" : "items-center justify-center p-4"}
              pointer-events-none
            `}
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={transition}
          >
            <GlassPanel
              className={`
                pointer-events-auto w-full
                ${isMobile
                  ? "h-full"
                  : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl max-h-[90vh]"}
                flex flex-col overflow-hidden
              `}
            >
              {/* header */}
              <div className="flex justify-between items-center px-6 py-4 border-b bg-white/50 backdrop-blur-sm flex-shrink-0 rounded-t-2xl overflow-hidden">
                <h2 className="text-lg font-medium text-[var(--olivea-ink)]">
                  {lang === "es" ? "Reservaciones" : "Reservations"}
                </h2>
                <button
                  onClick={closeReservationModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* tabs */}
              <div className="flex bg-gray-50 flex-shrink-0">
                {(["restaurant", "hotel", "cafe"] as ReservationType[]).map((id) => {
                  const label =
                    id === "restaurant"
                      ? lang === "es"
                        ? "Restaurante"
                        : "Restaurant"
                      : id === "hotel"
                      ? lang === "es"
                        ? "Casa Olivea"
                        : "Hotel"
                      : lang === "es"
                      ? "Café"
                      : "Cafe";

                  return (
                    <button
                      key={id}
                      onClick={() => setReservationType(id)}
                      className={`
                        flex-1 py-3 text-center transition-colors
                        ${
                          reservationType === id
                            ? "border-b-4 border-[var(--olivea-olive)] text-[var(--olivea-olive)] font-semibold"
                            : "text-[var(--olivea-ink)] hover:bg-gray-50"
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* content area */}
              <div className="relative flex-1 min-h-0 overflow-auto">
                {reservationType === "hotel" ? (
                  // placeholder for Cloudbeds immersive widget
                  <div id="cloudbeds-immersive" className="h-full w-full" />
                ) : (
                  <iframe
                    src={iframeUrl}
                    title={`${reservationType} reservation`}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                )}
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}