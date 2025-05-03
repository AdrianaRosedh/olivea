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

    // Clear previous content
    container.innerHTML = "";

    // Inject the Tock loader script once
    if (!document.querySelector('script[src*="tock.js"]')) {
      const headScript = document.createElement("script");
      headScript.textContent = `!function(t,o,c,k){/*…*/}(window,document);`;
      document.head.appendChild(headScript);
    }

    // Build the widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.id = "Tock_widget_container";
    widgetContainer.setAttribute("data-tock-display-mode", "Inline");
    widgetContainer.setAttribute("data-tock-color-mode", "White");
    widgetContainer.setAttribute("data-tock-locale", "en-us");
    widgetContainer.setAttribute("data-tock", token);
    widgetContainer.setAttribute("data-tock-offering", offeringId);

    container.appendChild(widgetContainer);

    return () => {
      // cleanup only the node we appended
      container.innerHTML = "";
    };
  }, [token, offeringId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] flex items-center justify-center"
    />
  );
}