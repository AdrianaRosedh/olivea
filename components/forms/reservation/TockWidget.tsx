// components/forms/reservation/TockWidget.tsx
"use client";

import { useEffect, useRef } from "react";
import { useReservation } from "@/contexts/ReservationContext";

/**
 * TockWidget: polls for the Tock stub, then initializes the widget
 * only once inside the reservation modal (restaurant tab).
 */
export default function TockWidget() {
  const { isOpen, reservationType } = useReservation();
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!isOpen || reservationType !== "restaurant" || didInitRef.current) return;

    const attemptInit = () => {
      // Safely access the tock function without using any
      const win = window as unknown as { tock?: (...args: unknown[]) => void };
      const tockFn = win.tock;
      if (typeof tockFn === "function") {
        didInitRef.current = true;
        tockFn("init", "olivea-farm-to-table", {
          displayType: "search",
          displayMode: "Button",
          colorMode: "Blue",
          locale: "es-mx",
          timezone: "America/Tijuana",
          containerId: "Tock_widget_container",
        });
      } else {
        setTimeout(attemptInit, 100);
      }
    };

    attemptInit();
  }, [isOpen, reservationType]);

  if (!isOpen || reservationType !== "restaurant") return null;

  return (
    <div
      id="Tock_widget_container"
      className="w-full"
      style={{ minHeight: 100 }}
    />
  );
}