// components/forms/reservation/TockWidget.tsx
"use client";

import { useEffect } from "react";
import { useReservation } from "@/contexts/ReservationContext";

// Tell TS about our two private flags—no need to re-declare `tock` itself.
declare global {
  interface Window {
    __tockStubInjected?: boolean;
    __tockScriptInjected?: boolean;
  }
}

interface TockWidgetProps {
  lang: string;
}

export default function TockWidget({ lang }: TockWidgetProps) {
  const { isOpen, reservationType } = useReservation();

  useEffect(() => {
    // Only run on your real production domain
    if (window.location.host !== "www.casaolivea.com") return;

    if (isOpen && reservationType === "restaurant") {
      // 1) Inject the stub exactly once
      if (!window.__tockStubInjected) {
        window.__tockStubInjected = true;

        // Build a fresh stub function (non-nullable)
        const stubFn = ((...args: unknown[]) => {
          stubFn.queue!.push(args);
        }) as NonNullable<Window["tock"]>;

        // Initialize its queue, loaded, version
        stubFn.queue   = [];
        stubFn.loaded  = true;
        stubFn.version = "1.0";

        // Assign it to window.tock
        window.tock = stubFn;
      }

      // 2) Inject the real script exactly once
      if (!window.__tockScriptInjected) {
        window.__tockScriptInjected = true;

        const script = document.createElement("script");
        script.src   = "https://www.exploretock.com/tock.js";
        script.async = true;
        script.onload  = () => console.debug("[TockWidget] tock.js loaded");
        script.onerror = (e) => console.warn("[TockWidget] tock.js error", e);
        document.head.appendChild(script);
      }

      // 3) Give the library a moment, then init + show
      setTimeout(() => {
        try {
          window.tock!(
            "init",
            "olivea-farm-to-table",
            { displayMode: "Overlay", displayType: "search" }
          );
          window.tock!("show");
        } catch (err) {
          console.warn("[TockWidget] init/show failed:", err);
        }
      }, 300);
    }
  }, [isOpen, reservationType]);

  // The actual overlay mounts itself to <body> via tock.show()
  return (
    <div
      id="Tock_widget_container"
      data-tock-color-mode="White"
      data-tock-locale={lang === "es" ? "es-mx" : "en-us"}
      data-tock-timezone="America/Tijuana"
      className="w-full h-full"
    />
  );
}