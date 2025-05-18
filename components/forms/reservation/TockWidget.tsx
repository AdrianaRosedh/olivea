// components/forms/reservation/TockWidget.tsx
"use client";

import React from "react";
import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { isOpen, reservationType } = useReservation();
  if (!isOpen || reservationType !== "restaurant") return null;

  return (
    <>
      {/* Step 2: Tock’s container in Button mode */}
      <div
        id="Tock_widget_container"
        className="w-full"
        style={{ minHeight: 100 }}
        data-tock-display-mode="Button"
        data-tock-color-mode="Blue"
        data-tock-locale="es-mx"
        data-tock-timezone="America/Tijuana"
      />

      {/* Step 3: init Tock afterInteractive */}
      <Script id="tock-init" strategy="afterInteractive">
        {`
          tock('init', 'olivea-farm-to-table', {
            displayType: 'search',
            displayMode: 'Button',
            colorMode: 'Blue',
            locale: 'es-mx',
            timezone: 'America/Tijuana',
            containerId: 'Tock_widget_container'
          });
        `}
      </Script>
    </>
  );
}