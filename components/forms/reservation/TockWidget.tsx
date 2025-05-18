"use client";
import { useEffect, useRef } from "react";
import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { reservationType } = useReservation();
  console.log("🔔 TockWidget render—reservationType:", reservationType);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("🔔 TockWidget useEffect fired—reservationType:", reservationType, "window.tock:", !!window.tock);
    if (reservationType !== "restaurant" || !ref.current) return;

    const init = () => {
      console.log("🔔 TockWidget trying to init");
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