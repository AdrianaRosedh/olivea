"use client";

import { useEffect, useState } from "react";

type Props = {
  autoLaunch?: boolean; // true when modal is open
};

export default function CloudbedsWidget({ autoLaunch }: Props) {
  const [shouldRenderFrame, setShouldRenderFrame] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Mount iframe ONCE when modal opens first time
  useEffect(() => {
    if (autoLaunch && !shouldRenderFrame) {
      setShouldRenderFrame(true);
    }
  }, [autoLaunch, shouldRenderFrame]);

  if (!shouldRenderFrame) {
    return (
      <div className="mt-4 flex justify-center text-xs text-[var(--olivea-ink)]/60">
        Cargando motor de reservaciones…
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <iframe
        src="/cloudbeds-immersive.html"
        title="Reservas Casa Olivea"
        className="w-full h-full"
        loading="eager"
        onLoad={() => setLoaded(true)}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          touchAction: "pan-y",
        }}
      />
    </div>
  );
}