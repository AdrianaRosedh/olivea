// components/PathTracker.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 🔒 Hard reset leaked locks on navigation
    try {
      document.body.style.overflow = "";
      document.body.style.removeProperty("touch-action");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");

      document.documentElement.style.removeProperty("overscroll-behavior");
    } catch {
      // noop
    }
  }, [pathname]);

  return null;
}
