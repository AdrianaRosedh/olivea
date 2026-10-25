// components/layout/MobileNavbar.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import AdaptiveNavbar from "@/components/navigation/AdaptiveNavbar";
import MobileDrawer from "@/components/navigation/MobileDrawer";
import { MobileNav } from "@/components/navigation/MobileNav";
import { useReservation } from "@/contexts/ReservationContext";
import { reserveDefault } from "@/lib/sections";
import { clearMenuKeepOpen, peekMenuKeepOpen } from "@/lib/menuLanguageSwitch";
import type { AppDictionary } from "@/app/[lang]/(main)/dictionaries";

type DrawerOrigin = { x: number; y: number };

export default function MobileNavbar({
  dictionary,
  /**
   * ✅ Force-enable AdaptiveNavbar even when viewport >= 768px
   * (used for iPad portrait + split view when LayoutShell decides “mobile-like”)
   */
  enabled = true,
}: {
  dictionary: AppDictionary;
  enabled?: boolean;
}) {
  const pathname = usePathname() ?? "/es";
  const { openReservationModal } = useReservation();

  // derive lang from URL
  const lang: "en" | "es" = useMemo(() => {
    const firstSeg = pathname.split("/")[1];
    return firstSeg === "en" ? "en" : "es";
  }, [pathname]);

  // Starts open after a language switch made from inside the menu: this
  // component mounts fresh under the new [lang], and the guest should land in
  // the same open menu, now translated, not on the page as if it reloaded.
  const [drawerOpen, setDrawerOpen] = useState(peekMenuKeepOpen);
  const [drawerOrigin, setDrawerOrigin] = useState<DrawerOrigin | undefined>(undefined);

  const toggleDrawer = useCallback(() => {
    navigator.vibrate?.(10);
    clearMenuKeepOpen();
    setDrawerOpen((v) => !v);
  }, []);

  const closeDrawer = useCallback(() => {
    clearMenuKeepOpen();
    setDrawerOpen(false);
  }, []);

  // Once the menu has reappeared after a language switch, the note has done
  // its job; clear it shortly after so a later page change closes as usual.
  useEffect(() => {
    if (!drawerOpen || !peekMenuKeepOpen()) return;
    const t = window.setTimeout(clearMenuKeepOpen, 1500);
    return () => window.clearTimeout(t);
  }, [drawerOpen]);

  const handleReserve = useCallback(() => {
    const id = reserveDefault(pathname); // "casa" | "farmtotable" | "cafe" | null
    const map: Record<"casa" | "farmtotable" | "cafe", "hotel" | "restaurant" | "cafe"> = {
      casa: "hotel",
      farmtotable: "restaurant",
      cafe: "cafe",
    };
    openReservationModal(id ? map[id] : undefined);
  }, [openReservationModal, pathname]);

  // Close drawer on navigation change (prevents stale open drawer), except
  // the language switch made from the menu itself.
  useEffect(() => {
    if (peekMenuKeepOpen()) return;
    setDrawerOpen(false);
  }, [pathname]);

  // Preserve desktop-only reserve event behavior (as you had it)
  useEffect(() => {
    const onReserve = () => {
      // if you ever want to allow on mobile-like too, remove this media check
      if (window.matchMedia("(min-width: 768px)").matches) handleReserve();
    };
    window.addEventListener("olivea:reserve", onReserve);
    return () => window.removeEventListener("olivea:reserve", onReserve);
  }, [handleReserve]);

  return (
    <>
      <AdaptiveNavbar
        lang={lang}
        isDrawerOpen={drawerOpen}
        onToggleDrawer={toggleDrawer}
        onDrawerOriginChange={setDrawerOrigin}
        enabled={enabled}
      />

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        lang={lang}
        dict={dictionary}
        origin={drawerOrigin}
      />

      <MobileNav isDrawerOpen={drawerOpen} />
    </>
  );
}