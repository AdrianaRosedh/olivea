"use client";

import { useEffect } from "react";

/** Local helper types to avoid global augmentation conflicts. */
type WhistleConfig = {
  company: string;
  source: string;
  open?: () => void;
};
type WhistleGlobals = {
  __whistleInjected?: boolean;
  WhistleLiveChat?: WhistleConfig;
};
type RequestIdleCb = (cb: () => void, opts?: { timeout: number }) => number;

export default function LoadWhistleClient({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    // Strongly-typed local handle to window — no global augmentation
    const w = window as typeof window & WhistleGlobals;

    // prevent duplicate loads across desktop/mobile renders and HMR
    if (w.__whistleInjected) return;
    w.__whistleInjected = true;

    // Safely detect/request idle time without redeclaring lib.dom.d.ts types
    const ric: RequestIdleCb | undefined = (w as unknown as { requestIdleCallback?: RequestIdleCb })
      .requestIdleCallback;

    const scheduleIdle = (cb: () => void) => {
      if (typeof ric === "function") {
        ric(cb, { timeout: 2500 });
      } else {
        setTimeout(cb, 1200);
      }
    };

    scheduleIdle(() => {
      w.WhistleLiveChat = {
        company: "295565",
        source: "https://plugins.whistle.cloudbeds.com",
      };

      const s = document.createElement("script");
      s.src = "https://plugins.whistle.cloudbeds.com/live-chat/initialize.js";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    });
  }, [enabled]);

  return null;
}
