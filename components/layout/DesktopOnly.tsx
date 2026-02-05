// components/layout/DesktopOnly.tsx
"use client";

import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  minWidth?: number; // default md
  fallback?: React.ReactNode;
};

export default function DesktopOnly({
  children,
  minWidth = 768,
  fallback = null,
}: Props) {
  const get = () =>
    typeof window !== "undefined"
      ? window.matchMedia(`(min-width: ${minWidth}px)`).matches
      : false;

  // ✅ immediate correct value on first render
  const [isDesktop, setIsDesktop] = useState<boolean>(get);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, [minWidth]);

  if (!isDesktop) return <>{fallback}</>;
  return <>{children}</>;
}
