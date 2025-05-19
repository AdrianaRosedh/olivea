"use client";

import { useEffect } from "react";

export default function TockWidget() {
  useEffect(() => {
    if (window.tock) {
      window.tock("init", "olivea-farm-to-table");
      console.log("✅ Tock re-initialized by TockWidget");
    }
  }, []);

  return <div id="Tock_widget_container" data-tock-display-mode="Inline" data-tock-offering-id="528232"
    data-tock-color-mode="White" data-tock-locale="es-mx"
    data-tock-timezone="America/Tijuana" style={{ minHeight: 600 }} />;
}
