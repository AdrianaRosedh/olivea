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
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Force widget to mobile layout (stacked) */
        #Tock_widget_container {
          max-width: 360px !important; /* critical width forcing mobile */
          margin: 0 auto !important;
          overflow: auto !important;
        }

        /* Custom Button Styling */
        #Tock_widget_container .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          border-radius: 8px !important;
          font-weight: bold !important;
        }

        #Tock_widget_container .TockInlineButton-container:hover {
          opacity: 0.9 !important;
        }

        /* Additional mobile-responsive fixes */
        @media (max-width: 768px) {
          #Tock_widget_container {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="flex-1 flex justify-center items-start p-6 overflow-auto">
        <div className="p-4 bg-white rounded-xl w-full max-w-lg overflow-hidden">
          <div
            id="Tock_widget_container"
            data-tock-display-mode="Inline"
            data-tock-widget="data-tock-offering"
            data-tock-offering-id="528232"
            data-tock-color-mode="White"
            data-tock-locale="es-mx"
            data-tock-timezone="America/Tijuana"
            style={{ minHeight: "400px" }}
          />
        </div>
      </div>
    </>
  );
}