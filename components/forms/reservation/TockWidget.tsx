// components/forms/reservation/TockWidget.tsx
"use client";

import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

interface Props {
  lang: string;
}

export default function TockWidget({ lang }: Props) {
  const { isOpen, reservationType } = useReservation();

  // Only render when modal is open AND on the Restaurant tab
  if (!(isOpen && reservationType === "restaurant")) {
    return null;
  }

  // pick locale code
  const locale = lang === "es" ? "es-mx" : "en-us";

  return (
    <>
      {/* 
        Anchor for Tock to mount its overlay 
        (we give it full size via your modal container styles)
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

      {/* Load the tock.js script *once*, then init+show */}
      <Script
        id="tock-load-and-init"
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.tock?.(
            "init",
            "olivea-farm-to-table",
            {
              displayType: "search",
              displayMode: "Overlay",
              colorMode: "White",
              locale,
              timezone: "America/Tijuana",
              containerId: "Tock_widget_container",
            }
          );
          window.tock?.("show");
        }}
      />
    </>
  );
}
