"use client";

import { useEffect, useMemo, useState } from "react";

export type DeviceClass = {
  isPhoneWidth: boolean;     // <= phoneMax
  isTabletWidth: boolean;    // phoneMax+1 .. mobileMax
  isDesktopWidth: boolean;   // >= mobileMax+1

  isTouchLike: boolean;      // pointer: coarse OR hover: none
  isHoverCapable: boolean;   // hover:hover AND pointer:fine

  uiMode: "mobile" | "desktop";
  useMobileChrome: boolean;  // ✅ mobile navbar + bottom nav
};

function mm(query: string): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  return window.matchMedia(query);
}

export function useDeviceClass(opts?: {
  phoneMax?: number;  // default 767
  mobileMax?: number; // ✅ default 1023 (your requested breakpoint)
}): DeviceClass {
  const phoneMax = opts?.phoneMax ?? 767;
  const mobileMax = opts?.mobileMax ?? 1023;

  const q = useMemo(
    () => ({
      phone: `(max-width: ${phoneMax}px)`,
      tablet: `(min-width: ${phoneMax + 1}px) and (max-width: ${mobileMax}px)`,
      desktop: `(min-width: ${mobileMax + 1}px)`,

      coarse: `(pointer: coarse)`,
      noHover: `(hover: none)`,
      hoverFine: `(hover: hover) and (pointer: fine)`,
    }),
    [phoneMax, mobileMax]
  );

  const [state, setState] = useState<DeviceClass>(() => {
    const isPhoneWidth = mm(q.phone)?.matches ?? false;
    const isTabletWidth = mm(q.tablet)?.matches ?? false;
    const isDesktopWidth = mm(q.desktop)?.matches ?? false;

    const coarse = mm(q.coarse)?.matches ?? false;
    const noHover = mm(q.noHover)?.matches ?? false;
    const isHoverCapable = mm(q.hoverFine)?.matches ?? false;

    const isTouchLike = coarse || noHover;

    // ✅ “Mobile chrome” if width <= 1023 OR touch-like
    const useMobileChrome = isPhoneWidth || isTabletWidth || isTouchLike;

    const uiMode: DeviceClass["uiMode"] = useMobileChrome ? "mobile" : "desktop";

    return {
      isPhoneWidth,
      isTabletWidth,
      isDesktopWidth,
      isTouchLike,
      isHoverCapable,
      uiMode,
      useMobileChrome,
    };
  });

  useEffect(() => {
    const lists = [q.phone, q.tablet, q.desktop, q.coarse, q.noHover, q.hoverFine]
      .map((s) => mm(s))
      .filter(Boolean) as MediaQueryList[];

    let raf = 0;

    const recompute = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const isPhoneWidth = mm(q.phone)?.matches ?? false;
        const isTabletWidth = mm(q.tablet)?.matches ?? false;
        const isDesktopWidth = mm(q.desktop)?.matches ?? false;

        const coarse = mm(q.coarse)?.matches ?? false;
        const noHover = mm(q.noHover)?.matches ?? false;
        const isHoverCapable = mm(q.hoverFine)?.matches ?? false;

        const isTouchLike = coarse || noHover;
        const useMobileChrome = isPhoneWidth || isTabletWidth || isTouchLike;

        setState({
          isPhoneWidth,
          isTabletWidth,
          isDesktopWidth,
          isTouchLike,
          isHoverCapable,
          uiMode: useMobileChrome ? "mobile" : "desktop",
          useMobileChrome,
        });
      });
    };

    recompute();

    lists.forEach((mq) => {
      mq.addEventListener?.("change", recompute);
      mq.addListener?.(recompute);
    });

    return () => {
      cancelAnimationFrame(raf);
      lists.forEach((mq) => {
        mq.removeEventListener?.("change", recompute);
        mq.removeListener?.(recompute);
      });
    };
  }, [q]);

  return state;
}