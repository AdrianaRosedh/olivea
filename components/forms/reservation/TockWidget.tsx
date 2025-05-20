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

.TockInlineButton {
  width: 100% !important;
}

/* Custom Button */
.TockInlineButton-container {
  background-color: var(--olivea-olive) !important;
  color: white !important;
  font-weight: bold !important;
  border-radius: 12px !important;
  padding: 10px !important;
}
`}</style>
    <div className="flex justify-center p-6">
      <div
        className="
          bg-white 
          rounded-xl 
          w-full 
          max-w-full      
          md:max-w-lg     
          overflow-hidden 
          flex flex-col 
          justify-center 
          items-center
          py-8            
        "
      >
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
    </>
  );
}
