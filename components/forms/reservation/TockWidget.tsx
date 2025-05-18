// components/forms/reservation/TockWidget.tsx
"use client";

import React, { useEffect } from "react";
import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { isOpen, reservationType } = useReservation();

  useEffect(() => {
    if (!isOpen || reservationType !== "restaurant") return;
    if (typeof window === "undefined" || typeof window.tock !== "function") {
      console.warn("Tock not ready yet");
      return;
    }

    // Initialize Tock into your container
    window.tock("init", "olivea-farm-to-table", {
      displayType: "search",
      displayMode: "Button",
      colorMode: "Blue",
      locale: "es-mx",
      timezone: "America/Tijuana",
      containerId: "Tock_widget_container",
    });
  }, [isOpen, reservationType]);

  // Only render the container when the restaurant tab is active
  if (!isOpen || reservationType !== "restaurant") {
    return null;
  }

  return (
    <div
      id="Tock_widget_container"
      className="w-full"
      style={{ minHeight: 100 }}
    />
  );
}