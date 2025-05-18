// components/forms/reservation/TockWidget.tsx
"use client";

import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

interface Props {
  lang: string;
}

export default function TockWidget({ lang }: Props) {
  const { isOpen, reservationType } = useReservation();

  return (
    <>
      {isOpen && reservationType === "restaurant" && (
        <>
          {/* 
            The container div: 
            - data-tock-business   → your tock slug 
            - display-type “search” → shows all offerings
            - display-mode “Overlay” → full-screen
          */}
          <div
            id="Tock_widget_container"
            data-tock-business="olivea-farm-to-table"
            data-tock-display-type="search"
            data-tock-display-mode="Overlay"
            data-tock-color-mode="White"
            data-tock-locale={lang === "es" ? "es-mx" : "en-us"}
            data-tock-timezone="America/Tijuana"
            className="w-full h-full"
          />

          {/* the real script loader */}
          <Script
            id="tock-script"
            src="https://www.exploretock.com/tock.js"
            strategy="afterInteractive"
            onLoad={() => {
              // once it’s loaded, `show` will mount the overlay based on
              // the above data attributes.
              window.tock?.("show");
            }}
          />
        </>
      )}
    </>
  );
}
