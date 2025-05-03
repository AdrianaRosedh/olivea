"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export function CloudbedsImmersive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content
    container.innerHTML = "";

    // Create the Cloudbeds “Book Now” button
    const button = document.createElement("button");
    button.setAttribute("data-be-url", "https://hotels.cloudbeds.com/reservation/pkwNrX");
    button.textContent = "Book Now";
    container.appendChild(button);

    return () => {
      // cleanup the exact same node we mutated
      container.innerHTML = "";
    };
  }, []); // no deps

  const handleScriptLoad = () => {
    console.log("Cloudbeds script loaded successfully");
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full relative">
      <Script
        id="cloudbeds-script"
        src="https://hotels.cloudbeds.com/widget/load/pkwNrX/immersive"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <div
        ref={containerRef}
        className="w-full h-full min-h-[500px] flex items-center justify-center"
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--olivea-olive)]"></div>
        </div>
      )}
    </div>
  );
}