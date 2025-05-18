// components/forms/reservation/TockWidget.tsx
"use client";

import React, { useEffect } from "react";
import { useReservation } from "@/contexts/ReservationContext";

/**
 * TockWidget renders the Tock reservation overlay inside the reservation modal.
 * It initializes and shows the Tock widget in Overlay mode when the restaurant tab is active.
 * In development (localhost) or staging, it skips initialization to avoid CSP/domain errors.
 */
export default function TockWidget() {
  const { isOpen, reservationType } = useReservation();

  useEffect(() => {
    // Only attempt initialization when client-side, modal open, and restaurant tab active
    if (typeof window === "undefined" || !isOpen || reservationType !== "restaurant") {
      return;
    }

    const host = window.location.hostname;
    // Skip Tock init on local or unauthorized domains
    if (host.includes("localhost") || host.includes("127.0.0.1") || host.endsWith("-staging")) {
      console.info("TockWidget: skipping Tock initialization on local or staging domain");
      return;
    }

    // Safely access window.tock without using any
    const maybeTock = (window as unknown as { tock?: (...args: unknown[]) => void }).tock;
    if (typeof maybeTock !== "function") {
      console.warn("TockWidget: Tock script not found");
      return;
    }

    try {
      // Initialize Tock with overlay mode into our container
      maybeTock("init", "olivea-farm-to-table", {
        displayType: "search",
        displayMode: "Overlay",
        colorMode: "Blue",
        locale: "es-mx",
        timezone: "America/Tijuana",
        containerId: "Tock_widget_container",
      });

      // Immediately show the reservation overlay
      maybeTock("show");
    } catch (error) {
      console.error("TockWidget initialization error:", error);
    }
  }, [isOpen, reservationType]);

  // Only render the container when the modal is open on the restaurant tab
  if (!isOpen || reservationType !== "restaurant") {
    return null;
  }

  return (
    <div
      id="Tock_widget_container"
      className="w-full h-full"
      aria-label="Tock reservation widget container"
    />
  );
}