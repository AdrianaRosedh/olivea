"use client";

import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Tailwind md = 768 by default */
  minWidth?: number;
  /** Optional: render this while detecting (defaults to null) */
  fallback?: React.ReactNode;
};

export default function DesktopOnly({
  children,
  minWidth = 768,
  fallback = null,
}: Props) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);

    const update = () => setIsDesktop(mq.matches);
    update();

    // Safari fallback
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } else {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, [minWidth]);

  if (isDesktop === null) return <>{fallback}</>;
  if (!isDesktop) return null;

  return <>{children}</>;
}