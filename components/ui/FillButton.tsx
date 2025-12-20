// components/ui/FillButton.tsx
"use client";

import Link from "next/link";
import type { MouseEvent as ReactMouseEvent } from "react";

interface FillButtonProps {
  href:     string;
  label:    string;
  isActive: boolean;
}

export function FillButton({ href, label, isActive }: FillButtonProps) {
  function handleMouseEnter(e: ReactMouseEvent<HTMLAnchorElement>) {
    // Cast the native event to the browser's MouseEvent so offsetX is typed
    const nativeEv = e.nativeEvent as globalThis.MouseEvent;
    const x = nativeEv.offsetX;
    e.currentTarget.style.setProperty("--hover-x", `${x}px`);
  }

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      className={[
        "relative px-6 py-2.5 h-13 min-w-47.5 whitespace-nowrap rounded-md border flex items-center justify-center font-medium text-base uppercase tracking-wide fill-nav",
        isActive
          ? "bg-(--olivea-olive) text-white border-(--olivea-olive)"
          : "text-(--olivea-olive) border-(--olivea-olive)",
      ].join(" ")}
    >
      <span className="z-front">{label}</span>
    </Link>
  );
}