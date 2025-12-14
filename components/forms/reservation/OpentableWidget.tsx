"use client";

import React from "react";

function OpenTableWidgetImpl() {
  return (
    <div className="h-full w-full p-2 sm:p-6 bg-(--olivea-cream)">
      <div className="h-full w-full rounded-md sm:rounded-xl overflow-hidden bg-(--olivea-cream)">
        <iframe
          title="Reservar en Olivea Farm To Table en OpenTable"
          src="https://www.opentable.com.mx/booking/restref/availability?lang=es-MX&restRef=1313743&otSource=Restaurant%20website"
          className="h-full w-full block"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          scrolling="yes"
          style={{
            border: "none",
            background: "transparent",
          }}
          allow="fullscreen; payment"
        />
      </div>
    </div>
  );
}

const OpentableWidget = React.memo(OpenTableWidgetImpl);
export default OpentableWidget;
