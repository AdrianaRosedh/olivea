// components/forms/reservation/TockLoader.tsx
"use client";
import { useEffect } from "react";
import Script from "next/script";

export default function TockLoader() {
  return (
    <>
      {/* Load Tock itself once hydration finishes */}
      <Script
        id="tock-script"
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
      />

      {/* Once it’s on window, call init */}
      <InitTock />
    </>
  );
}

function InitTock() {
  useEffect(() => {
    window.tock?.("init", "olivea-farm-to-table");
  }, []);
  return null;
}
