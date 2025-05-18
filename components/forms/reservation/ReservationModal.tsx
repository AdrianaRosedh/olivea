"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence, type Variants, type Transition } from "framer-motion";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";

// Dynamically import widgets
const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), { ssr: false });
const TockWidget     = dynamic(() => import("./TockWidget"),     { ssr: false });

interface ReservationModalProps {
  lang: string;
}

export default function ReservationModal({ lang }: ReservationModalProps) {
  const { isOpen, closeReservationModal, reservationType, setReservationType } = useReservation();
  const [isMobile, setIsMobile] = useState(false);

  // track mobile breakpoint
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const variants: Variants = {
    closed: isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
    open:   isMobile ? { y:    0,    opacity: 1 } : { scale: 1,   opacity: 1 },
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
            className={`fixed inset-0 z-[1300] flex ${
              isMobile 
                ? "items-end justify-center p-0" 
                : "items-center justify-center p-4"
            } pointer-events-none`}
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={transition}
          >
            <div
              className={`pointer-events-auto bg-[#e8e4d5] w-full ${
                isMobile
                  ? "h-full rounded-t-2xl"
                  : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl"
              } flex flex-col overflow-hidden`}
            >
              {/* header */}
              <div className="relative flex items-center px-6 py-4 border-b backdrop-blur-sm flex-shrink-0">
                <h2
                  className="absolute inset-0 flex items-center justify-center text-center pointer-events-none"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: isMobile ? 24 : 32,
                    fontWeight: 200,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--olivea-ink)",
                    lineHeight: 1,
                  }}
                >
                  {lang === "es" ? "Reservaciones" : "Reservations"}
                </h2>
                <button
                  onClick={closeReservationModal}
                  aria-label="Close modal"
                  className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors z-10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* tabs */}
              <div className="flex bg-[#e8e4d5] flex-shrink-0">
                {(["restaurant", "hotel", "cafe"] as ReservationType[]).map((id) => {
                  const label = id === "restaurant"
                    ? lang === "es" ? "Restaurante" : "Restaurant"
                    : id === "hotel"
                    ? lang === "es" ? "Hotel"       : "Hotel"
                    : lang === "es" ? "Café"        : "Cafe";

                  return (
                    <button
                      key={id}
                      onClick={() => setReservationType(id)}
                      className={`flex-1 py-3 text-center transition-colors ${
                        reservationType === id
                          ? "border-b-4 border-[var(--olivea-olive)] text-[var(--olivea-olive)] font-semibold"
                          : "text-[var(--olivea-ink)] hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* content */}
              <div className="relative flex-1 overflow-auto bg-white">
                {reservationType === "hotel"      && <CloudbedsWidget />}
                {reservationType === "restaurant" && <TockWidget lang={lang} />}
                {reservationType === "cafe"       && (
                  <div className="absolute inset-0 flex items-center justify-center italic text-neutral-500">
                    {lang === "es" ? "Próximamente disponible." : "Coming Soon."}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
