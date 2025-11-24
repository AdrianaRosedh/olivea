"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://static1.cloudbeds.com/booking-engine/latest/static/js/immersive-experience/cb-immersive-experience.js";

type Props = {
  autoLaunch?: boolean;
};

export default function CloudbedsWidget({ autoLaunch }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<Element | null>(null); // <-- FIXED HERE

  // 1. Load Cloudbeds Immersive script (React does not manage it)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // 2. Inject the Cloudbeds button as **raw HTML**, not JSX
  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = `
      <cb-book-now-button
        property-code="pkwnrX"
        mode="popup"
        height="90vh"
        width="90vw"
        style="opacity:0;pointer-events:none;position:absolute;width:1px;height:1px;"
      ></cb-book-now-button>
    `;

    // attach reference to the actual element
    buttonRef.current =
      containerRef.current.querySelector("cb-book-now-button");
  }, []);

  // 3. Trigger the popup when Hotel tab is active
  useEffect(() => {
    if (!autoLaunch) return;

    const id = setTimeout(() => {
      buttonRef.current?.dispatchEvent(new Event("click", { bubbles: true }));
    }, 600); // small delay so the script initializes

    return () => clearTimeout(id);
  }, [autoLaunch]);

  if (!autoLaunch) return null;

  return <div ref={containerRef} />;
}
