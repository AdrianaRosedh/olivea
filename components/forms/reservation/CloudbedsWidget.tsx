"use client";

import { useState } from "react";

export default function CloudbedsWidget() {
  const [loaded, setLoaded] = useState(false);

  // Always render iframe as soon as widget mounts (preload)
  // No autoLaunch required anymore
  return (
    <div
      className={`w-full h-full transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <iframe
        src="/cloudbeds-immersive.html"
        title="Reservas Casa Olivea"
        className="w-full h-full"
        loading="eager"           // force eager load
        onLoad={() => setLoaded(true)}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          touchAction: "pan-y",
        }}
      />
    </div>
  );
}
