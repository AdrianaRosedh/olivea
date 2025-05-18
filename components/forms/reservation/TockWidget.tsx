// components/forms/reservation/TockWidget.tsx
"use client";

import { useEffect, useRef } from "react";
import { useReservation } from "@/contexts/ReservationContext";

interface TockWidgetProps {
  lang: string;
}

export default function TockWidget({ lang }: TockWidgetProps) {
  const { isOpen, reservationType } = useReservation();
  const hasShown = useRef(false);

  useEffect(() => {
    // nothing until modal is open AND "restaurant" tab is active
    if (!isOpen || reservationType !== "restaurant") {
      hasShown.current = false;
      return;
    }

    // avoid calling tock on dev/un-whitelisted hosts
    const host = window.location.host;
    const isDev = host.includes("localhost") || host.includes("vercel.app");
    if (isDev) {
      console.debug("[TockWidget] skipping tock.init/show on dev host:", host);
      return;
    }

    // only run init/show once per open
    if (hasShown.current) return;
    hasShown.current = true;

    if (window.tock) {
      try {
        window.tock(
          "init",
          "olivea-farm-to-table",
          {
            displayMode: "Overlay",   // full-screen overlay
            displayType: "search",    // show all offerings
            colorMode: "White",
            locale: lang === "es" ? "es-mx" : "en-us",
            timezone: "America/Tijuana",
          }
        );
        window.tock("show");
      } catch (err) {
        console.warn("[TockWidget] tock init/show failed:", err);
      }
    }
  }, [isOpen, reservationType, lang]);

  // Overlay mode mounts itself on <body>—no DOM node needed here
  return null;
}
