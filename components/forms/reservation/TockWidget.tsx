"use client";

import { useEffect, useRef } from "react";
import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { isOpen, reservationType } = useReservation();
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && reservationType === "restaurant" && widgetRef.current) {
      const initTock = () => {
        if (window.tock) {
          window.tock("init", "olivea-farm-to-table");
        } else {
          setTimeout(initTock, 200);
        }
      };
      initTock();
    }
  }, [isOpen, reservationType]);

  // Always mount the container for stable behavior
  return (
    <div
      ref={widgetRef}
      id="Tock_widget_container"
      data-tock-display-mode="Button"
      data-tock-color-mode="Blue"
      data-tock-locale="es-mx"
      data-tock-timezone="America/Tijuana"
      style={{
        width: "100%",
        minHeight: "100px",
        opacity: reservationType === "restaurant" ? 1 : 0,
        pointerEvents: reservationType === "restaurant" ? "auto" : "none",
        transition: "opacity 300ms ease",
      }}
    />
  );
}