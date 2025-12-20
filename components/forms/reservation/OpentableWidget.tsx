"use client";

import React from "react";

function OpenTableWidgetImpl() {
  return (
    // min-h-0 is key when parent is a flex item with overflow
    <div className="w-full h-full min-h-0 bg-(--olivea-cream) overflow-hidden">
      <iframe
        title="Reservar en Olivea Farm To Table en OpenTable"
        src="https://www.opentable.com.mx/booking/restref/availability?lang=es-MX&restRef=1313743&otSource=Restaurant%20website"
        className="w-full h-full block"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        scrolling="yes"
        style={{
          border: "none",
          background: "transparent",
          // helps iOS treat this as a scrollable region when embedded
          WebkitOverflowScrolling: "touch",
        }}
        allow="fullscreen; payment"
      />
    </div>
  );
}

export default React.memo(OpenTableWidgetImpl);