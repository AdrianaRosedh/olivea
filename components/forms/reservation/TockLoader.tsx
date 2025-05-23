"use client";
import { useEffect } from "react";
import Script from "next/script";

export default function TockLoader() {
  return (
    <>
      {/* just load the script itself (no onLoad handler here) */}
      <Script
        id="tock-script"
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
      />
      {/* once it’s on the page, init it in a client useEffect */}
      <InitTock />
    </>
  );
}

function InitTock() {
  useEffect(() => {
    if (window.tock) {
      window.tock("init", "olivea-farm-to-table");
    }
    else {
      console.error("📛 tock.js failed to load?");
    }
  }, []);

  return null;
}
