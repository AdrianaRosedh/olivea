"use client";
import { useEffect, useRef, useState } from "react";

export function CloudbedsImmersive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current!;
    // 1) clear
    container.innerHTML = "";

    // 2) inject the button Cloudbeds looks for
    const button = document.createElement("button");
    button.setAttribute(
      "data-be-url",
      "https://hotels.cloudbeds.com/reservation/pkwNrX"
    );
    container.appendChild(button);

    // 3) inject the immersive loader script
    const script = document.createElement("script");
    script.src = "https://hotels.cloudbeds.com/widget/load/pkwNrX/inline";
    script.async = true;

    script.onload = () => {
      // once script is ready, auto‐click the button
      button.click();
      setIsLoading(false);
    };

    container.appendChild(script);

    // 4) clean up on unmount
    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--olivea-olive)]" />
        </div>
      )}
    </div>
  );
}