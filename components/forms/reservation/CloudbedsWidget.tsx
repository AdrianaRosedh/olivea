"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  /** When true, auto-open the Immersive popup (Hotel tab active + modal open) */
  autoLaunch?: boolean;
};

interface CbBookNowButtonProps extends React.HTMLAttributes<HTMLElement> {
  "property-code": string;
  mode?: "standard" | "popup";
  height?: string;
  width?: string;
  "class-name"?: string;
}

/**
 * React wrapper around the <cb-book-now-button> web component.
 * Uses React.createElement so TS/JSX stay happy.
 */
const CbBookNowButton = React.forwardRef<HTMLElement, CbBookNowButtonProps>(
  (props, ref) =>
    React.createElement("cb-book-now-button", {
      ...props,
      ref,
    })
);

CbBookNowButton.displayName = "CbBookNowButton";

export default function CloudbedsWidget({ autoLaunch }: Props) {
  const buttonRef = useRef<HTMLElement | null>(null);

  // When autoLaunch flips true (Hotel tab), click the hidden button to open the popup
  useEffect(() => {
    if (!autoLaunch) return;

    const id = window.setTimeout(() => {
      buttonRef.current?.click();
    }, 300); // tiny delay to ensure the script is ready

    return () => window.clearTimeout(id);
  }, [autoLaunch]);

  // Only render when Hotel tab + modal are active
  if (!autoLaunch) return null;

  return (
    <CbBookNowButton
      ref={buttonRef}
      property-code="pkwnrX"         // <- your property code from the BE URL
      mode="popup"                   // popup Immersive Experience
      height="90vh"
      width="90vw"
      class-name="cb-book-now-button"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}
