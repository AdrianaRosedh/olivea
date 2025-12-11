"use client";

import React, { useEffect } from "react";

const IMMERSIVE_SRC =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

interface CloudbedsImmersiveProps
  extends React.HTMLAttributes<HTMLElement> {
  "property-code": string;
  mode?: "standard" | "popup";
  lang?: string;
  currency?: string;
  "ignore-search-params"?: "yes" | "no";
}

/**
 * Load the Immersive script once (first time the widget is mounted).
 */
function ensureImmersiveScript() {
  if (typeof window === "undefined") return;

  // Avoid adding the script multiple times
  if (document.querySelector(`script[src="${IMMERSIVE_SRC}"]`)) return;

  const s = document.createElement("script");
  s.src = IMMERSIVE_SRC;
  s.defer = true;
  s.async = true;
  document.head.appendChild(s);
}

export default function CloudbedsWidget({
  lang = "es",
}: {
  lang?: "es" | "en";
}) {
  useEffect(() => {
    ensureImmersiveScript();
  }, []);

  const tagName = "cb-immersive-experience";

  return (
    <div className="relative w-full min-h-full bg-[var(--olivea-cream)]">
      {/* Olivea loader overlay while Cloudbeds boots */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="px-4 py-2 rounded-full border border-[var(--olivea-olive)]/40 bg-[var(--olivea-cream)]/90 text-[10px] uppercase tracking-[0.18em] text-[var(--olivea-ink)]/70">
          Cargando motor seguro…
        </div>
      </div>

      {React.createElement(
        tagName,
        {
          "property-code": "pkwnrX",
          mode: "standard",
          lang,
          currency: "mxn",
          "ignore-search-params": "yes",
        } as CloudbedsImmersiveProps
      )}
    </div>
  );
}