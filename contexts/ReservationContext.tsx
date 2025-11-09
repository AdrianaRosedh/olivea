// contexts/ReservationContext.tsx
"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

/** Canonical tabs used across the app */
export type ReservationType = "restaurant" | "hotel" | "cafe";

/** Legacy aliases still used in a few places */
type LegacyReservationType = "farmtotable" | "casa" | "cafe";

/** Map legacy names → canonical names */
function toCanonical(type: ReservationType | LegacyReservationType): ReservationType {
  if (type === "farmtotable") return "restaurant";
  if (type === "casa") return "hotel";
  return type; // "restaurant" | "hotel" | "cafe"
}

type ReservationContextValue = {
  /** Modal state */
  isOpen: boolean;

  /** Open/close (canonical) */
  open: (type?: ReservationType | LegacyReservationType) => void;
  close: () => void;

  /** Back-compat method names expected by existing components */
  openReservationModal: (type?: ReservationType | LegacyReservationType) => void;
  closeReservationModal: () => void;

  /** Current tab */
  reservationType: ReservationType;
  setReservationType: (type: ReservationType | LegacyReservationType) => void;
};

/** Null default to force provider usage (no `as any`) */
const ReservationContext = createContext<ReservationContextValue | null>(null);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  // Default selection: align with prior behavior (restaurant == farmtotable)
  const [reservationType, _setReservationType] = useState<ReservationType>("restaurant");
  const [isOpen, setIsOpen] = useState(false);

  const setReservationType = (type: ReservationType | LegacyReservationType) => {
    _setReservationType(toCanonical(type));
  };

  const open = (type?: ReservationType | LegacyReservationType) => {
    if (type) _setReservationType(toCanonical(type));
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  // Back-compat method names
  const openReservationModal = (type?: ReservationType | LegacyReservationType) => open(type);
  const closeReservationModal = () => close();

  const value = useMemo<ReservationContextValue>(
    () => ({
      isOpen,
      open,
      close,
      openReservationModal,
      closeReservationModal,
      reservationType,
      setReservationType,
    }),
    [isOpen, reservationType]
  );

  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>;
}

/** Guarded consumer hook */
export function useReservation(): ReservationContextValue {
  const ctx = useContext(ReservationContext);
  if (!ctx) {
    throw new Error("useReservation must be used within <ReservationProvider>");
  }
  return ctx;
}
