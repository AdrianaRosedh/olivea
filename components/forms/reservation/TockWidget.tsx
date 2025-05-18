"use client";

import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { reservationType } = useReservation();

  if (reservationType !== "restaurant") return null;

  return (
    <iframe
      src="/restaurant-widget"
      title="Olivea Restaurant Reservations"
      style={{
        border: "none",
        width: "100%",
        minHeight: "500px",
      }}
    />
  );
}
