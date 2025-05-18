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
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";

// load it client-side only
const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), { ssr: false });
// const TockWidget      = dynamic(() => import("./TockWidget"),      { ssr: false });

// …other imports
import ReserveButton from "./ReserveButton";

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

  // ─── local form state for restaurant ─────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("19:00");
  const [size, setSize] = useState("2");
  // ─────────────────────────────────────────────────────────

  // detect mobile (…)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // lock scroll (…)
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const variants: Variants = {
    closed: isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 },
    open:   isMobile ? { y: 0,        opacity: 1 } : { scale: 1,   opacity: 1 },
  };
  const transition: Transition = isMobile
    ? { type: "spring", stiffness: 200, damping: 25 }
    : { duration: 0.4, ease: "easeOut" };

  return (
    <AnimatePresence>
      {/* backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={closeReservationModal}
      />

      {/* modal container */}
      <motion.div
        className={`fixed inset-0 z-[1300] flex pointer-events-none ${
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
            isMobile
              ? "w-full h-full rounded-t-2xl"
              : "w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl h-[90vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center px-6 py-4 border-b flex-shrink-0">
            <h2 className="absolute inset-0 flex items-center justify-center pointer-events-none text-[var(--olivea-ink)] uppercase" style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 24 : 32, fontWeight: 200, letterSpacing: "0.15em" }}>
              {lang === "es" ? "Reservaciones" : "Reservations"}
            </h2>
            <button
              onClick={closeReservationModal}
              aria-label="Close modal"
              className="ml-auto p-2 rounded-full hover:bg-[var(--olivea-olive)] hover:text-[var(--olivea-cream)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#e8e4d5] flex-shrink-0">
            {(["restaurant", "hotel", "cafe"] as ReservationType[]).map((id) => {
              const label =
                id === "restaurant"
                  ? lang === "es" ? "Restaurante" : "Restaurant"
                  : id === "hotel"
                  ? lang === "es" ? "Hotel" : "Hotel"
                  : lang === "es" ? "Café" : "Cafe";
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

          {/* Content */}
          <div className="relative flex-1 overflow-auto bg-white">
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
              className={`absolute inset-0 p-6 flex flex-col space-y-4 transition-opacity duration-300 ${
                reservationType === "restaurant"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {/* date */}
              <label>
                {lang === "es" ? "Fecha" : "Date"}
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full border p-2 rounded"
                />
              </label>

              {/* time */}
              <label>
                {lang === "es" ? "Hora" : "Time"}
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="block w-full border p-2 rounded"
                />
              </label>

              {/* party size */}
              <label>
                {lang === "es" ? "Personas" : "Party Size"}
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="block w-full border p-2 rounded"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>

              {/* the Tock “Reserve” button */}
              <div className="mt-4">
              <ReserveButton
                business="olivea-farm-to-table"
                offeringId="528232"
                date={date}
                time={time}
                size={size}
                className="w-full py-3 bg-[var(--olivea-olive)] text-white rounded">
                {lang === "es" ? "Reservar Ahora" : "Book Now"}
              </ReserveButton>

              </div>
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
    </AnimatePresence>
  );
}
