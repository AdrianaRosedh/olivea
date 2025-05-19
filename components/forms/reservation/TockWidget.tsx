"use client";

import { useEffect } from "react";

export default function TockWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.tock =
      window.tock ||
      function (...args: any[]) {
        (window.tock!.queue = window.tock!.queue || []).push(args);
      };

    const scriptId = "tock-js-script";

    if (document.getElementById(scriptId)) {
      window.tock!("init", "olivea-farm-to-table");
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = "https://www.exploretock.com/tock.js";
    document.head.appendChild(script);

    script.onload = () => {
      window.tock!("init", "olivea-farm-to-table");
      console.log("✅ Tock loaded and initialized");
    };

    script.onerror = () => {
      console.error("❌ Failed to load Tock.js");
    };
  }, []);

  return null;
}
