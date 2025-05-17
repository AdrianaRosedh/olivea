// components/forms/reservation/TockWidget.tsx
"use client";
import { useEffect, useRef } from "react";

export function TockWidget({
  token,
  offeringId,
}: {
  token: string;
  offeringId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.id = "Tock_widget_container";
    widgetContainer.setAttribute("data-tock-display-mode", "Inline");
    widgetContainer.setAttribute("data-tock-color-mode", "White");
    widgetContainer.setAttribute("data-tock-locale", "en-us");
    widgetContainer.setAttribute("data-tock", token);
    widgetContainer.setAttribute("data-tock-offering", offeringId);

    container.appendChild(widgetContainer);

    const scriptUrl = "https://www.exploretock.com/tock.js";
    const scriptExists = document.querySelector(`script[src="${scriptUrl}"]`);

    const initializeTock = () => {
      if (window.tock?.callMethod) {
        window.tock.callMethod("init");
      } else {
        console.warn("Tock script loaded but method unavailable.");
      }
    };

    if (!scriptExists) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.onload = initializeTock;
      document.head.appendChild(script);
    } else {
      const existingScript = scriptExists as HTMLScriptElement;
      if (existingScript.getAttribute("data-loaded") === "true") {
        initializeTock();
      } else {
        existingScript.addEventListener("load", initializeTock);
      }
    }

    return () => {
      container.innerHTML = "";
    };
  }, [token, offeringId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[600px] flex items-center justify-center bg-white"
    />
  );
}