// components/forms/reservation/TockWidget.tsx
"use client";

import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { reservationType } = useReservation();

  // Only load & init when the Restaurant tab is active
  if (reservationType !== "restaurant") {
    return null;
  }

  return (
    <>
      {/* Load the Tock JS library on demand */}
      <Script
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window.tock === "function") {
            window.tock("init", "olivea-farm-to-table");
          } else {
            console.error("Tock did load, but window.tock is not a function");
          }
        }}
      />

      {/* Container where Tock will inject its UI */}
      <div
        id="Tock_widget_container"
        data-tock-display-mode="Button"
        data-tock-color-mode="Blue"
        data-tock-locale="es-mx"
        data-tock-timezone="America/Tijuana"
        style={{ width: "100%", minHeight: 100 }}
      />
    </>
  );
}
