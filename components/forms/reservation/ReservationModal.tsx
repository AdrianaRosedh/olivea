"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useReservation, type ReservationType } from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";
import Script from "next/script";

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={closeReservationModal}
      />

      <motion.div
        className={`fixed inset-0 z-[1300] flex ${isMobile ? "items-end justify-center p-0" : "items-center justify-center p-4"}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className={`bg-white overflow-auto ${isMobile ? "w-full h-full rounded-t-2xl" : "rounded-xl max-w-3xl w-full max-h-[90vh]"}`}>
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl uppercase tracking-wider">
              {lang === "es" ? "Reservaciones" : "Reservations"}
            </h2>
            <button onClick={closeReservationModal}>
              <X size={20} />
            </button>
          </div>

          <div className="flex border-b">
            {(["restaurant", "hotel", "cafe"] as ReservationType[]).map((id) => (
              <button
                key={id}
                className={`flex-1 py-3 ${
                  reservationType === id ? "border-b-2 border-black font-bold" : ""
                }`}
                onClick={() => setReservationType(id)}
              >
                {id === "restaurant" ? (lang === "es" ? "Restaurante" : "Restaurant") : id === "hotel" ? "Hotel" : (lang === "es" ? "Café" : "Cafe")}
              </button>
            ))}
          </div>

          <div className="p-6">
            {reservationType === "restaurant" && (
              <>
                <label>
                  {lang === "es" ? "Fecha" : "Date"}
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded p-2 mt-2"/>
                </label>
                <label className="mt-4 block">
                  {lang === "es" ? "Hora" : "Time"}
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded p-2 mt-2"/>
                </label>
                <label className="mt-4 block">
                  {lang === "es" ? "Personas" : "Party Size"}
                  <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full border rounded p-2 mt-2">
                    {Array.from({ length: 10 }, (_, i) => <option key={i}>{i+1}</option>)}
                  </select>
                </label>
                <div
                  id="Tock_widget_container"
                  data-tock-display-mode="Inline"
                  data-tock-widget="data-tock-offering"
                  data-tock-offering-id="528232"
                  data-tock-color-mode="Blue"
                  data-tock-locale="es-mx"
                  data-tock-timezone="America/Tijuana"
                  data-tock-date={date}
                  data-tock-time={time}
                  data-tock-size={size}
                  className="mt-6"
                  style={{ width: "100%", height: "600px" }}
                />
              </>
            )}

            {reservationType === "hotel" && <CloudbedsWidget />}
            {reservationType === "cafe" && <div>{lang === "es" ? "Próximamente disponible." : "Coming Soon."}</div>}
          </div>
        </div>
      </motion.div>

      <Script
        id="tock-widget-script"
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.tock && typeof window.tock === 'function') {
            window.tock("init", "olivea-farm-to-table");
            console.log("✅ Tock successfully loaded and initialized");
          } else {
            console.error("❌ Tock failed to initialize: window.tock missing");
          }
        }}
      />
    </AnimatePresence>
  );
}