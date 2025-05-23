// components/forms/reservation/RestaurantReservation.tsx
"use client";

import { useState } from "react";
import Script from "next/script";
import TockWidget from "./TockWidget"; // your div#Tock_widget_container

export default function RestaurantReservation() {
  const [tockReady, setTockReady] = useState(false);

  return (
    <>
      {/* 1️⃣ Load & init tock.js on-demand */}
      <Script
        id="tock-runtime"
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.tock?.("init", "olivea-farm-to-table");
          setTockReady(true);
        }}
      />

      {/* 2️⃣ While tock.js is loading, show a spinner or placeholder */}
      {!tockReady ? (
        <div className="p-6 text-center">Cargando reservas…</div>
      ) : (
        // 3️⃣ Only once ready, render the Tock container
        <TockWidget offeringId="528232" />
      )}
    </>
  );
}
