"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, type Variants, type Transition } from "framer-motion";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";

const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), { ssr: false });

interface ReservationModalProps { lang: "es" | "en"; }

export default function ReservationModal({ lang }: ReservationModalProps) {
  const { isOpen, closeReservationModal, reservationType, setReservationType } = useReservation();

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("19:00");
  const [size, setSize] = useState("2");
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

  const variants: Variants = {
    closed: isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
    open: isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 },
  };

  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 200, damping: 25 }
    : { duration: 0.4, ease: "easeOut" };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={closeReservationModal}
      />

      <motion.div
        className={`fixed inset-0 z-[1300] flex ${
          isMobile ? "items-end justify-center p-0" : "items-center justify-center p-4"
        }`}
        initial="closed"
        animate="open"
        exit="closed"
        variants={variants}
        transition={transition}
      >
        <div
          className={`pointer-events-auto bg-[#e8e4d5] flex flex-col overflow-hidden ${
            isMobile ? "w-full h-full rounded-t-2xl" : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center px-6 py-4 border-b flex-shrink-0 pointer-events-auto">
            <h2
              className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--olivea-ink)] uppercase"
              style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 24 : 32, fontWeight: 200, letterSpacing: "0.15em" }}
            >
              {lang === "es" ? "Reservaciones" : "Reservations"}
            </h2>
            <button
              onClick={closeReservationModal}
              aria-label="Close"
              className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors pointer-events-auto"
            >
              <X size={20}/>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#e8e4d5] flex-shrink-0 pointer-events-auto">
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
          <div className="relative flex-1 overflow-auto bg-white pointer-events-auto">
            {/* Hotel Pane */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${
                reservationType === "hotel" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <CloudbedsWidget/>
            </div>

            {/* Restaurant Pane */}
            <div className={`absolute inset-0 p-6 flex flex-col space-y-4 transition-opacity duration-300 overflow-auto ${
                reservationType === "restaurant" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <label>
                {lang === "es" ? "Fecha" : "Date"}
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="block w-full border p-2 rounded"/>
              </label>
              <label>
                {lang === "es" ? "Hora" : "Time"}
                <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="block w-full border p-2 rounded"/>
              </label>
              <label>
                {lang === "es" ? "Personas" : "Party Size"}
                <select value={size} onChange={e=>setSize(e.target.value)} className="block w-full border p-2 rounded">
                  {Array.from({length:10},(_,i)=><option key={i}>{i+1}</option>)}
                </select>
              </label>
              <div
                id="Tock_widget_container"
                data-tock-display-mode="Inline"
                data-tock-offering="528232"
                data-tock-color-mode="White"
                data-tock-locale="es-mx"
                data-tock-timezone="America/Tijuana"
                className="mt-4"
                style={{ width: "100%", minHeight: "600px" }}
              />
            </div>

            {/* Café Pane */}
            <div className={`absolute inset-0 flex items-center justify-center italic text-neutral-500 transition-opacity duration-300 ${
                reservationType === "cafe" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              {lang === "es" ? "Próximamente disponible." : "Coming Soon."}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}