// components/PathTracker.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { forceUnlockBodyScroll } from "@/components/ui/scrollLock";

export default function PathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 🔒 Hard reset leaked locks on navigation (and reset lockCount safely)
    try {
      forceUnlockBodyScroll();
      document.body.style.removeProperty("touch-action");

      document.documentElement.style.removeProperty("overscroll-behavior");
    } catch {
      // noop
    }
  }, [pathname]);

  return null;
}
