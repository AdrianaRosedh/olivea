"use client";

import { useEffect, useState } from "react";

type Props = {
  // true = modal is open
  autoLaunch?: boolean;
};

export default function CloudbedsWidget({ autoLaunch }: Props) {
  const [shouldRenderFrame, setShouldRenderFrame] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // As soon as the modal is opened once, keep the iframe mounted forever
  useEffect(() => {
    if (autoLaunch && !shouldRenderFrame) {
      setShouldRenderFrame(true);
    }
  }, [autoLaunch, shouldRenderFrame]);

  if (!shouldRenderFrame) {
    // First time: show a tiny placeholder under your “Completa tu reserva…” text
    return (
      <div className="mt-6 flex justify-center text-xs text-[var(--olivea-ink)]/60">
        Cargando motor de reservaciones de Cloudbeds…
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      {!loaded && (
        <div className="mt-6 mb-2 text-xs text-[var(--olivea-ink)]/60 animate-pulse">
          Cargando motor de reservaciones…
        </div>
      )}

      <iframe
        src="/cloudbeds-immersive.html"
        title="Reservas Casa Olivea"
        className="w-full h-[70vh] md:h-[75vh] rounded-lg border border-[var(--olivea-olive)]/15 shadow-sm bg-white"
        loading="eager"            // eager so it starts as soon as it exists
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}