// components/forms/reservation/TockWidget.tsx
"use client";

import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

interface Props {
  lang: string;
}

export default function TockWidget({ lang }: Props) {
  const { isOpen, reservationType } = useReservation();
  const showRestaurant = isOpen && reservationType === "restaurant";

  return (
    <>
      {/* This div is just the container for the overlay */}
      <div
        id="Tock_widget_container"
        data-tock-display-mode="Overlay"
        data-tock-display-type="search"
        data-tock-color-mode="White"
        data-tock-locale={lang === "es" ? "es-mx" : "en-us"}
        data-tock-timezone="America/Tijuana"
        className="w-full h-full"
      />

      {showRestaurant && (
        <Script
          src="https://www.exploretock.com/tock.js"
          strategy="afterInteractive"
          onLoad={() => {
            // only call if window.tock is defined
            window.tock?.(
              "init",
              "olivea-farm-to-table",
              {
                displayMode: "Overlay",
                displayType: "search",
              }
            );
            window.tock?.("show");
          }}
        />
      )}
    </>
  );
}
