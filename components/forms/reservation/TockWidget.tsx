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
      {/* only load+init when modal is open AND on the “restaurant” tab */}
      {isOpen && reservationType === "restaurant" && (
        <Script
          src="https://www.exploretock.com/tock.js"
          strategy="afterInteractive"
          onLoad={() => {
            // now that the real tock.js is loaded, initialize with search mode
            window.tock?.(
              "init",
              "olivea-farm-to-table", // your business slug
              {
                displayMode: "Overlay",  // fullscreen overlay
                displayType: "search",   // show all offerings
                colorMode: "White",      // match your UI
                locale: lang === "es" ? "es-mx" : "en-us",
                timezone: "America/Tijuana",
              }
            );
            // immediately pop it open
            window.tock?.("show");
          }}
        />
      )}

      {/* this empty div is where tock.show() will mount its overlay */}
      <div
        id="Tock_widget_container"
        className="w-full h-full"
        // you can also pass data-attributes here if you prefer:
        // data-tock-display-mode="Overlay"
        // data-tock-display-type="search"
        // data-tock-color-mode="White"
        // data-tock-locale={lang === "es" ? "es-mx" : "en-us"}
        // data-tock-timezone="America/Tijuana"
      />
    </>
  );
}
