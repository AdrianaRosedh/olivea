"use client";

import { useEffect } from "react";

interface TockWidgetProps {
  lang: string;
}

export default function TockWidget({ lang }: TockWidgetProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If stub not yet installed, create it and inject real script
    if (!window.tock) {
      const stub = (...args: unknown[]) => {
        stub.queue.push(args);
      };
      stub.queue = [] as unknown[];
      stub.loaded = true;
      stub.version = "1.0";
      stub.callMethod = stub;

      window.tock = stub;

      const s = document.createElement("script");
      s.src = "https://www.exploretock.com/tock.js";
      s.async = true;
      s.onload = () => {
        window.tock!("init", "olivea-farm-to-table");
        window.tock!("show");
      };
      document.head.appendChild(s);
    } else {
      // Already loaded? Just re-init & show
      try {
        window.tock("init", "olivea-farm-to-table");
        window.tock("show");
      } catch {}
    }
  }, []);

  return (
    <div
      id="Tock_widget_container"
      data-tock-display-mode="Overlay"
      data-tock-color-mode="White"
      data-tock-locale={lang === "es" ? "es-mx" : "en-us"}
      data-tock-timezone="America/Tijuana"
      className="w-full h-full min-h-[300px]"
    />
  );
}
