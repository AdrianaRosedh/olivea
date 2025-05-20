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

        /* Adjust labels and texts for elegance */
        .MainLabelSpan, .MainLabelLabel {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-size: 16px !important;
        }
            
        /* Custom Button Styling */
        .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          font-weight: 600 !important;
          border: none !important;
        }
            
        .TockInlineButton-container:hover {
          opacity: 0.9 !important;
        }
          
      `}</style>


      <div className="flex-1 flex justify-center items-start p-6">
        <div className="p-6 bg-white rounded-xl w-full max-w-none ">
          <div
            id="Tock_widget_container"
            data-tock-display-mode="Inline"
            data-tock-widget="data-tock-offering"
            data-tock-offering-id="528232"
            data-tock-color-mode="White"
            data-tock-locale="es-mx"
            data-tock-timezone="America/Tijuana"
          />
        </div>
      </div>
    </>
  );
}