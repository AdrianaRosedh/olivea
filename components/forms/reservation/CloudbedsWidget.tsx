"use client";

import React from "react";

/**
 * Cloudbeds embed:
 * - memoized to avoid re-renders
 * - loading="lazy" (it still loads immediately when *first* mounted)
 * - referrerPolicy tightened
 */
function CloudbedsWidgetImpl() {
  return (
    <div className="w-full h-full">
      <iframe
        title="Cloudbeds Reservation"
        src="https://hotels.cloudbeds.com/reservation/pkwNrX?currency=mxn"
        className="w-full h-full border-none"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="fullscreen; payment"
        // Avoid sandbox; Cloudbeds injects scripts that will be blocked by sandbox.
      />
    </div>
  );
}

const CloudbedsWidget = React.memo(CloudbedsWidgetImpl);
export default CloudbedsWidget;
