"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import AdaptiveNavbar from "@/components/navigation/AdaptiveNavbar";
import MobileDrawer from "@/components/navigation/MobileDrawer";
import { MobileNav } from "@/components/navigation/MobileNav";
import { useReservation } from "@/contexts/ReservationContext";
import { reserveDefault } from "@/lib/sections";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";

export default function MobileNavbar({ dictionary }: { dictionary: AppDictionary }) {
  const pathname = usePathname() ?? "/es";
  const { openReservationModal } = useReservation();

  // derive lang from URL
  const firstSeg = pathname.split("/")[1];
  const lang: "en" | "es" = firstSeg === "en" ? "en" : "es";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerOrigin, setDrawerOrigin] = useState<{ x: number; y: number } | undefined>(
    undefined
  );

  const toggleDrawer = useCallback(() => {
    navigator.vibrate?.(10);
    setDrawerOpen((v) => !v);
  }, []);

  const handleReserve = useCallback(() => {
    const id = reserveDefault(pathname); // "casa" | "farmtotable" | "cafe"
    const map: Record<"casa" | "farmtotable" | "cafe", "hotel" | "restaurant" | "cafe"> = {
      casa: "hotel",
      farmtotable: "restaurant",
      cafe: "cafe",
    };
    openReservationModal(map[id]);
  }, [openReservationModal, pathname]);

  // Preserve your desktop-only reserve event behavior if you need it,
  // but for mobile this usually stays off.
  useEffect(() => {
    const onReserve = () => {
      // if you ever want to allow, remove this media check
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
      />

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lang={lang}
        dict={dictionary}
        origin={drawerOrigin}
      />

      <MobileNav isDrawerOpen={drawerOpen} />
    </>
  );
}
