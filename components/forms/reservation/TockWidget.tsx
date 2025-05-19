"use client";

import { useEffect } from "react";

export default function TockWidget() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (window.tock) {
        window.tock("init", "olivea-farm-to-table");
        console.log("✅ Tock initialized successfully");
      } else {
        console.error("❌ Tock failed to initialize");
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      id="Tock_widget_container"
      data-tock-display-mode="Inline"
      data-tock-widget="data-tock-offering"
      data-tock-offering-id="528232"
      data-tock-color-mode="White"
      data-tock-locale="es-mx"
      data-tock-timezone="America/Tijuana"
      className="absolute inset-0 overflow-auto"
      style={{ minHeight: "100%" }}
    />
  );
}
