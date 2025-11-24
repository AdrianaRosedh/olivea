"use client";

import React, { useEffect } from "react";

const IMMERSIVE_SCRIPT_SRC =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

type Props = {
  /** When true, render the Immersive Booking Engine inside the modal */
  autoLaunch?: boolean;
};

/**
 * Props for the Cloudbeds <cb-immersive-experience> custom element.
 * Typed so TS + ESLint stay happy.
 */
interface CbImmersiveExperienceProps extends React.HTMLAttributes<HTMLElement> {
  "property-code": string;
  mode?: "standard" | "popup";
  lang?: string; // e.g. "es" | "en"
  currency?: string; // e.g. "mxn"
  "ignore-search-params"?: "yes" | "no";
}

/**
 * React wrapper for the <cb-immersive-experience> web component.
 * Uses React.createElement so we don't touch the JSX intrinsic element typing.
 */
const CbImmersiveExperience = React.forwardRef<
  HTMLElement,
  CbImmersiveExperienceProps
>((props, ref) =>
  React.createElement("cb-immersive-experience", {
    ...props,
    ref,
  })
);

CbImmersiveExperience.displayName = "CbImmersiveExperience";

export default function CloudbedsWidget({ autoLaunch }: Props) {
  // Load Immersive Experience script once (registers the web components)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${IMMERSIVE_SCRIPT_SRC}"]`
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = IMMERSIVE_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // If the Hotel tab / modal is not active, don't render the component at all
  if (!autoLaunch) return null;

  return (
    <div className="w-full h-full max-w-5xl mx-auto">
      <CbImmersiveExperience
        property-code="pkwnrX"
        mode="standard" // or "popup", but inside the modal "standard" feels more natural
        lang="es"
        currency="mxn"
        style={{ width: "100%", height: "100%", minHeight: "60vh" }}
      />
    </div>
  );
}
