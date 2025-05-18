// components/forms/reservation/TockWidget.tsx
"use client";

import { useEffect } from "react";
import { useReservation } from "@/contexts/ReservationContext";

interface TockWidgetProps {
  lang: string;
}

export default function TockWidget({ lang }: TockWidgetProps) {
  const { isOpen, reservationType } = useReservation();

  useEffect(() => {
    if (isOpen && reservationType === "restaurant" && window.tock) {
      // initialize (with our options) and immediately show
      window.tock(
        "init",
        "olivea-farm-to-table",
        {
          displayMode: "Overlay",    // full‐screen overlay
          displayType: "search",     // “show all offerings”
        }
      );
      window.tock("show");
    }
  }, [isOpen, reservationType]);

  // this div just holds the overlay—the overlay itself will be
  // mounted to <body> by tock.show()
  return (
    <div
      id="Tock_widget_container"
      data-tock-display-mode="Overlay"
      data-tock-display-type="search" 
      data-tock-color-mode="White"
      data-tock-locale={lang === "es" ? "es-mx" : "en-us"}
      data-tock-timezone="America/Tijuana"
      className="w-full h-full"
    />
  );
}
