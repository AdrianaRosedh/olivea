"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, type Variants, type Transition } from "framer-motion";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";
import TockWidget from "./RestaurantWidget";

const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), { ssr: false });

interface ReservationModalProps {
  lang: "es" | "en";
}

export default function ReservationModal({ lang }: ReservationModalProps) {
  const { isOpen, closeReservationModal, reservationType, setReservationType } = useReservation();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width:767px)");
    const handleMediaChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handleMediaChange);
    return () => mql.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants: Variants = {
    closed: isMobile
      ? { y: "100%", opacity: 0 }
      : { scale: 0.85, opacity: 0 },
    open: isMobile
      ? { y: 0, opacity: 1 }
      : { scale: 1, opacity: 1 },
  };

  const modalTransition: Transition = isMobile
    ? { type: "spring", stiffness: 250, damping: 30 }
    : { type: "spring", stiffness: 300, damping: 30 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] pointer-events-auto"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            transition={{ duration: 0.2 }}
            onClick={closeReservationModal}
          />

          <motion.div
            className={`fixed inset-0 z-[1300] flex ${
              isMobile ? "items-end justify-center p-0" : "items-center justify-center p-4"
            }`}
            initial="closed"
            animate="open"
            exit="closed"
            variants={modalVariants}
            transition={modalTransition}
          >
            <div
              className={`pointer-events-auto bg-[var(--olivea-cream)] flex flex-col overflow-hidden ${
                isMobile
                  ? "w-full h-full rounded-t-2xl"
                  : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl"
              }`}
            >
              {/* Header */}
              <div className="relative flex items-center px-6 py-4 border-b flex-shrink-0 pointer-events-auto">
                <h2
                  className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--olivea-ink)] uppercase"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: isMobile ? 24 : 32,
                    fontWeight: 200,
                    letterSpacing: "0.15em",
                  }}
                >
                  {lang === "es" ? "Reservaciones" : "Reservations"}
                </h2>
                <button
                  onClick={closeReservationModal}
                  aria-label="Close"
                  className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors pointer-events-auto"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-[var(--olivea-cream)] flex-shrink-0 pointer-events-auto">
                {(["restaurant", "hotel", "cafe"] as ReservationType[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setReservationType(id)}
                    className={`flex-1 py-3 text-center transition-colors pointer-events-auto ${
                      reservationType === id
                        ? "border-b-4 border-[var(--olivea-olive)] text-[var(--olivea-olive)] font-semibold"
                        : "text-[var(--olivea-ink)] hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)]"
                    }`}
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
                  </button>
                ))}
              </div>

              {/* Content Panes */}
              <div className="relative flex-1 overflow-auto bg-[var(--olivea-cream)] pointer-events-auto">
                {/* Hotel Pane */}
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    reservationType === "hotel"
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <CloudbedsWidget />
                </div>

                {/* Restaurant Pane */}
                <div
                  className={`absolute inset-0 p-6 transition-opacity duration-300 overflow-auto ${
                    reservationType === "restaurant"
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <TockWidget />
                </div>

                {/* Café Pane */}
                <div
                  className={`absolute inset-0 flex items-center justify-center italic text-neutral-500 transition-opacity duration-300 ${
                    reservationType === "cafe"
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  {lang === "es" ? "Próximamente disponible." : "Coming Soon."}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}