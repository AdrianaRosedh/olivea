"use client";

import React from "react";

function OpenTableWidgetImpl() {
  return (
    <div className="w-full h-full min-h-0 bg-(--olivea-cream) overflow-hidden">
      <iframe
        title="Reservar en Olivea Farm To Table en OpenTable"
        src="https://www.opentable.com.mx/booking/restref/availability?lang=es-MX&restRef=1313743&otSource=Restaurant%20website"
        className="w-full h-full block"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        // IMPORTANT: allow iOS to treat it like a scrollable embedded page
        scrolling="yes"
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