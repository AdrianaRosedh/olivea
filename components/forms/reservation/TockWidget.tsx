// components/forms/reservation/TockWidget.tsx
"use client";

import React from "react";
import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

/**
 * TockWidget renders the Tock reservation button inside the reservation modal.
 * It uses Tock's Button mode embed and ensures proper initialization for the container.
 */
export default function TockWidget() {
  const { isOpen, reservationType } = useReservation();

  // Only render when the modal is open on the "restaurant" tab
  if (!isOpen || reservationType !== "restaurant") {
    return null;
  }

  return (
    <>
      {/* Tock widget container in Button mode */}
      <div
        id="Tock_widget_container"
        className="w-full"
      />

      {/* Initialize Tock for this business once script has loaded */}
      <Script id="tock-init" strategy="afterInteractive">
        {`window.tock && window.tock('init', 'olivea-farm-to-table', {
  displayType: 'search',
  displayMode: 'Button',
  colorMode: 'Blue',
  locale: 'es-mx',
  timezone: 'America/Tijuana',
  containerId: 'Tock_widget_container'
});`}
      </Script>
    </>
  );
}
