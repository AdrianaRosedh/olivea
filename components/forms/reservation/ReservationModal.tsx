"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, type Variants, type Transition } from "framer-motion";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";
import OliveaLogo from "@/assets/oliveaFTT1.svg";
import { Plus_Jakarta_Sans } from "next/font/google";

const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), { ssr: false });
const TockWidget = dynamic(() => import("./TockWidget"), { ssr: false });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], display: "swap" });


interface ReservationModalProps {
  lang: "es" | "en";
}

export default function ReservationModal({ lang }: ReservationModalProps) {
  const { isOpen, closeReservationModal, reservationType, setReservationType } = useReservation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width:767px)");
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const modalVariants: Variants = {
    hidden: isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
    visible: isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 },
    exit: isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 200, damping: 25 }
    : { duration: 0.4, ease: "easeOut" };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            onClick={closeReservationModal}
          />

          {/* Modal Container */}
          <motion.div
            className={`fixed inset-0 z-[1300] flex ${isMobile ? "items-end" : "items-center justify-center p-4"}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            <div
              className={`bg-[var(--olivea-cream)] flex flex-col overflow-hidden ${
                isMobile
                  ? "w-full h-full rounded-t-2xl"
                  : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl"
              }`}
            >
              {/* Header */}
              <div className="relative flex items-center px-6 py-4 border-b flex-shrink-0">
                <h2
                  className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--olivea-ink)] uppercase tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 22 : 32, fontWeight: 200 }}
                >
                  {lang === "es" ? "Reservaciones" : "Reservations"}
                </h2>
                <button
                  onClick={closeReservationModal}
                  aria-label="Close"
                  className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors"
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
                    className={`
                      relative flex-1 py-3 text-center uppercase tracking-[0.15em] transition-colors
                      ${
                        reservationType === id
                          ? "text-[var(--olivea-olive)] font-semibold"
                          : "text-[var(--olivea-ink)] hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)]"
                      }
                    `}
                    style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 16 : 18, fontWeight: 400 }}
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

                    {/* Active underline indicator */}
                    {reservationType === id && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--olivea-olive)]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content Panes */}
              <div className="relative flex-1 overflow-auto bg-[var(--olivea-cream)]">
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
                  className={`absolute inset-0 flex flex-col transition-opacity duration-300 overflow-auto ${
                    reservationType === "restaurant"
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >

                <div className="flex items-center justify-start px-4 py-3 md:px-6 md:py-4 border-b border-neutral-300 bg-[var(--olivea-cream)] shadow-md">

                  {/* Slightly Larger Logo */}
                  <div className="h-[40px] w-auto md:h-[60px] flex-shrink-0">
                    <OliveaLogo className="h-full w-auto object-contain" />
                  </div>

                  {/* Further increased margin-left */}
                  <span
                    className={`${jakarta.className} font-bold whitespace-nowrap ml-5 md:ml-7 text-[var(--olivea-ink)]`}
                    style={{ fontSize: "clamp(0.9rem, 2vw, 1.15rem)" }}
                  >
                    Olivea Farm To Table
                  </span>

                </div>
        
                  {/* Tock Widget container */}
                  <div className="flex-1 flex justify-center items-start p-6">
                    <div className="p-6 bg-white rounded-xl w-full max-w-lg">
                      <div
                        id="Tock_widget_container"
                        data-tock-display-mode="Inline"
                        data-tock-widget="data-tock-offering"
                        data-tock-offering-id="528232"
                        data-tock-color-mode="White"
                        data-tock-locale="es-mx"
                        data-tock-timezone="America/Tijuana"
                        style={{ width: "100%", minHeight: "400px" }}
                      />
                    </div>
                  </div>
                
                  {reservationType === "restaurant" && <TockWidget />}
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