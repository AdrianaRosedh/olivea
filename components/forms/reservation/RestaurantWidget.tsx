"use client";

import { useEffect, useRef } from "react";

export default function RestaurantWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const timeout = setTimeout(() => {
      const container = document.getElementById("Tock_widget_container");
      if (container && window.tock) {
        container.innerHTML = "";
        window.tock("init", "olivea-farm-to-table");
        console.log("✅ Tock widget initialized");
        initialized.current = true;
      } else {
        console.error("❌ Tock initialization failed, retrying...");
        initialized.current = false;
      }
    }, 350); // Delayed initialization for DOM stability

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
