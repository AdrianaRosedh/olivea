// components/forms/reservation/TockWidget.tsx
"use client";

import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

interface Props {
  lang: string;
}

export default function TockWidget({ lang }: Props) {
  const { isOpen, reservationType } = useReservation();

  // only render this widget when the modal is open AND on the Restaurant tab
  if (!(isOpen && reservationType === "restaurant")) {
    return null;
  }

  // compute locale string for tock
  const locale = lang === "es" ? "es-mx" : "en-us";

  return (
    <>
      {/* 
        This <div> is the placeholder into which Tock will render.
        We still give it 100% width/height so the overlay can fill the screen.
      */}
      <div
        id="Tock_widget_container"
        data-tock-business="olivea-farm-to-table"
        data-tock-display-type="search"
        data-tock-display-mode="Overlay"
        data-tock-color-mode="White"
        data-tock-locale={locale}
        data-tock-timezone="America/Tijuana"
        className="w-full h-full"
      />

      {/* 
        Load the Tock script *once* when the widget first appears.
        In the onLoad we do both init(...) and show().
      */}
      <Script
        id="tock-init"
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
        onLoad={() => {
          // 1) initialize with our “search” options
          window.tock?.(
            "init",
            "olivea-farm-to-table",
            {
              displayType: "search",    // show all offerings
              displayMode: "Overlay",   // full screen overlay
              colorMode: "White",       // light theme
              locale,                   // es-mx or en-us
              timezone: "America/Tijuana",
              containerId: "Tock_widget_container"
            }
          );
          // 2) immediately pop it open
          window.tock?.("show");
        }}
      />
    </>
  );
}
