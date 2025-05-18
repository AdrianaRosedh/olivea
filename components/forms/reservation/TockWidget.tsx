"use client";
import { useEffect, useRef } from "react";
import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { reservationType } = useReservation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reservationType !== "restaurant" || !ref.current) return;

    const init = () => {
      if (window.tock) {
        window.tock("init", "olivea-farm-to-table");
      } else {
        setTimeout(init, 100);
      }
    };
    init();
  }, [reservationType]);

  return (
    <div
      ref={ref}
      id="Tock_widget_container"
      data-tock-display-mode="Button"
      data-tock-color-mode="Blue"
      data-tock-locale="es-mx"
      data-tock-timezone="America/Tijuana"
      style={{ width: "100%", minHeight: 100 }}
    />
  );
}