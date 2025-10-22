"use client";

import React from "react";

/**
 * OpenTable embed:
 * - memoized to avoid re-renders when parent updates
 * - loading="lazy" so it never blocks the main thread
 * - referrerPolicy tightened
 * - small container fixes (rounded, bg, typo fix)
 */
function OpenTableWidgetImpl() {
  return (
    <div className="flex-1 flex justify-center items-start p-2 sm:p-6 bg-[var(--olivea-cream)]">
      <div className="w-full max-w-none rounded-md sm:rounded-xl overflow-hidden bg-[var(--olivea-cream)]">
        <iframe
          title="Reservar en Olivea Farm To Table en OpenTable"
          src="https://www.opentable.com.mx/booking/restref/availability?lang=es-MX&restRef=1313743&otSource=Restaurant%20website"
          width="100%"
          height={640}
          loading="lazy"
          // Keep scripts; sandboxing third-party widgets usually breaks them, so omit sandbox.
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            border: "none",
            background: "transparent",
            display: "block",
            width: "100%",
            minWidth: 0,
          }}
          // Let the vendor request fullscreen/payment if they use it; harmless otherwise
          allow="fullscreen; payment"
        />
      </div>
    </div>
  );
}

const OpentableWidget = React.memo(OpenTableWidgetImpl);
export default OpentableWidget;
