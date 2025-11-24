"use client";

import { useEffect, useRef } from "react";

const CLOUDBEDS_URL = "https://hotels.cloudbeds.com/reservation/pkwnrX";
const WIDGET_SRC =
  "https://hotels.cloudbeds.com/widget/load/pkwnrX/immersive";

type Props = {
  /** When true, auto-open the Immersive booking overlay */
  autoLaunch?: boolean;
};

export default function CloudbedsWidget({ autoLaunch }: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // 1) Load the Immersive widget script once (Cloudbeds attaches to data-be-url button)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SRC}"]`
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 2) Auto-click the hidden button when autoLaunch is true
  useEffect(() => {
    if (!autoLaunch) return;

    const timeoutId = window.setTimeout(() => {
      // By now, the Cloudbeds script should have wired up the button
      if (buttonRef.current) {
        buttonRef.current.click();
      }
    }, 500); // small delay so the widget JS can attach

    return () => window.clearTimeout(timeoutId);
  }, [autoLaunch]);

  return (
    <button
      ref={buttonRef}
      type="button"
      data-be-url={CLOUDBEDS_URL}
      // No onClick here — Cloudbeds' script owns the click handling.
      className="sr-only"
    >
      Book Now
    </button>
  );
}
