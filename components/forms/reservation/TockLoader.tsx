// components/forms/reservation/TockLoader.tsx
"use client";

import { useState} from "react";
import Script from "next/script";

export default function TockLoader() {
  const [ready, setReady] = useState(false);

  return (
    <>
      {/* 1) Load the tock.js file */}
      <Script
        id="tock-runtime"
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
        onLoad={() => {
          // now that `window.tock` exists, initialize it
          window.tock?.("init", "olivea-farm-to-table");
          setReady(true);
          console.log("✅ Tock runtime loaded & init called");
        }}
      />

      {/* 2) Optionally render a fallback or spinner while not ready */}
      {!ready && <div>Loading reservation widget…</div>}
    </>
  );
}
