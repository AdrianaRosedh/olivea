"use client";

import React, { useState } from "react";

function OpenTableWidgetImpl({ lang = "es" }: { lang?: "es" | "en" }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full min-h-0 bg-(--olivea-cream) overflow-hidden">
      {/* Loading state — OpenTable's embed can take several seconds to paint
          (heavy third-party + a cookie-consent step). Show a brand placeholder
          until the iframe's load event fires so the pane never looks blank. */}
      <div
        aria-hidden
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-(--olivea-cream) text-(--olivea-olive) transition-opacity duration-500 ${
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <span className="h-7 w-7 rounded-full border-2 border-(--olivea-olive)/25 border-t-(--olivea-olive) animate-spin" />
        <span className="text-xs uppercase tracking-[0.18em] opacity-80">
          {lang === "en" ? "Loading availability…" : "Cargando disponibilidad…"}
        </span>
      </div>

      <iframe
        title="Reservar en Olivea Farm To Table en OpenTable"
        src="https://www.opentable.com.mx/booking/restref/availability?lang=es-MX&restRef=1313743&otSource=Restaurant%20website"
        className="w-full h-full block"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        // IMPORTANT: allow iOS to treat it like a scrollable embedded page
        scrolling="yes"
        onLoad={() => setLoaded(true)}
        style={{
          border: "none",
          background: "transparent",

          // Helps iOS/Safari:
          WebkitOverflowScrolling: "touch",

          // Make sure it can receive gestures
          pointerEvents: "auto",
          touchAction: "pan-y",

          // Weird but effective: promote to its own layer
          transform: "translateZ(0)",
        }}
        // give the iframe permission to open new windows if OT needs it
        allow="fullscreen; payment; clipboard-read; clipboard-write"
        // some embeds behave better with this
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}

export default React.memo(OpenTableWidgetImpl);
