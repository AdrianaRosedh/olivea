// components/forms/reservation/TockWidget.tsx
"use client";

import Script from "next/script";
import { useReservation } from "@/contexts/ReservationContext";

export default function TockWidget() {
  const { reservationType } = useReservation();

  // Only mount our widget when “Restaurant” is active
  if (reservationType !== "restaurant") return null;

  return (
    <>
      {/* ─── TOCK STUB + INIT ─────────────────────────── */}
      <Script
        id="tock-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod?e.callMethod.apply(e,arguments):
                  e.queue.push(arguments);
                };
                t._tock||(t._tock=e),e.push=e,e.loaded=!0,e.version='1.0',e.queue=[];
                var f=o.createElement(c);f.async=!0;f.src=k;
                var g=o.getElementsByTagName(c)[0];
                g.parentNode.insertBefore(f,g);
              }
            }(window,document,'script','https://www.exploretock.com/tock.js');
            tock('init', 'olivea-farm-to-table');
          `,
        }}
      />

      {/* ─── TOCK CONTAINER ───────────────────────────── */}
      <div
        id="Tock_widget_container"
        data-tock-display-mode="Button"
        data-tock-color-mode="Blue"
        data-tock-locale="es-mx"
        data-tock-timezone="America/Tijuana"
        style={{ width: "100%", minHeight: 100 }}
      />
    </>
  );
}
