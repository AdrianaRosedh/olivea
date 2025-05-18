// components/forms/reservation/TockWidget.tsx
"use client";

import { useEffect } from "react";
import { useReservation } from "@/contexts/ReservationContext";

/**
 * TockWidget: renders the Tock reservation button inside the modal.
 * Uses data attributes on the container div and a simple init call.
 */
export default function TockWidget() {
  const { isOpen, reservationType } = useReservation();

  useEffect(() => {
    if (!isOpen || reservationType !== "restaurant") return;

    // Poll for the tock function
    const win = window as unknown as { tock?: (...args: unknown[]) => void };
    const attemptInit = () => {
      if (typeof win.tock === "function") {
        win.tock("init", "olivea-farm-to-table");
      } else {
        setTimeout(attemptInit, 100);
      }
    };
    attemptInit();
  }, [isOpen, reservationType]);

  // Only render the placeholder when active
  if (!isOpen || reservationType !== "restaurant") {
    return null;
  }

  return (
    <div
      id="Tock_widget_container"
      data-tock-display-mode="Button"
      data-tock-color-mode="Blue"
      data-tock-locale="es-mx"
      data-tock-timezone="America/Tijuana"
      style={{ minHeight: 100, width: "100%" }}
    />
  );
}