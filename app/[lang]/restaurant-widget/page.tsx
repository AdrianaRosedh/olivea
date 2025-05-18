"use client";

import { useEffect } from "react";

export default function RestaurantWidgetPage() {
  useEffect(() => {
    if (window.tock) {
      window.tock("init", "olivea-farm-to-table");
    } else {
      const script = document.createElement("script");
      script.src = "https://www.exploretock.com/tock.js";
      script.async = true;
      script.onload = () => window.tock && window.tock("init", "olivea-farm-to-table");
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      id="Tock_widget_container"
      data-tock-display-mode="Standard"
      data-tock-color-mode="Blue"
      data-tock-locale="es-mx"
      data-tock-timezone="America/Tijuana"
      style={{ width: "100%", height: "100vh" }}
    />
  );
}
