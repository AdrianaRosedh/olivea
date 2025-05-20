"use client";

import { useEffect } from "react";

export default function TockWidget() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (window.tock) {
        window.tock("init", "olivea-farm-to-table");
        console.log("✅ Tock widget initialized");
      } else {
        console.error("❌ Tock script not loaded yet");
      }
    }, 200);  // Short delay for stability across browsers

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* DESKTOP STYLES */
        #Tock_widget_container {
          width: 100% !important;
        }

        /* MOBILE STYLES: Below 1024px */
        @media (max-width: 1024px) {
          #Tock_widget_container {
            max-width: 100% !important;
          }

          #Tock_widget_container > div {
            max-width: 400px !important;
            margin: 0 auto !important;
          }
        }

        /* Custom Tock Button Styling */
        #Tock_widget_container button {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          border-radius: 8px !important;
          font-weight: bold !important;
        }

        #Tock_widget_container button:hover {
          opacity: 0.9 !important;
        }
      `}</style>

      <div
        id="Tock_widget_container"
        data-tock-display-mode="Inline"
        data-tock-widget="data-tock-offering"
        data-tock-offering-id="528232"
        data-tock-color-mode="White"
        data-tock-locale="es-mx"
        data-tock-timezone="America/Tijuana"
        style={{ minHeight: "400px", width: "100%" }}
      />
    </>
  );
}
