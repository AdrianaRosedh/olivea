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
    <div className="flex-1 flex justify-center items-start p-6">
                    <div className="p-6 bg-white rounded-xl w-full max-w-lg">
                      <div
                        id="Tock_widget_container"
                        data-tock-display-mode="Inline"
                        data-tock-widget="data-tock-offering"
                        data-tock-offering-id="528232"
                        data-tock-color-mode="White"
                        data-tock-locale="es-mx"
                        data-tock-timezone="America/Tijuana"
                        style={{ width: "100%", minHeight: "400px" }}
                      />
                    </div>
                  </div>
  );
}
