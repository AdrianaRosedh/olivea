"use client";

import { useEffect, useState } from "react";

type Props = {
  autoLaunch?: boolean; // true when modal is open
};

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export default function CloudbedsWidget({ autoLaunch }: Props) {
  const [shouldRenderFrame, setShouldRenderFrame] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Detect mobile on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(isMobileViewport());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop: mount iframe once when modal opens
  useEffect(() => {
    if (!isMobile && autoLaunch && !shouldRenderFrame) {
      setShouldRenderFrame(true);
    }
  }, [autoLaunch, isMobile, shouldRenderFrame]);

  // Mobile: when Hotel tab is active, send user to full-page booking
  useEffect(() => {
    if (!isMobile) return;
    if (!autoLaunch) return;

    // Small delay so the UI feels responsive, then navigate in same tab
    const id = window.setTimeout(() => {
      window.location.href = "/cloudbeds-immersive.html";
    }, 200);

    return () => window.clearTimeout(id);
  }, [isMobile, autoLaunch]);

  // MOBILE: we don't render anything; we redirect instead
  if (isMobile) {
    return (
      <div className="mt-4 flex justify-center text-xs text-[var(--olivea-ink)]/60">
        Abriendo motor de reservaciones…
      </div>
    );
  }

  // DESKTOP: iframe inside modal
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