"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

/** Canonical tabs used across the app */
export type ReservationType = "restaurant" | "hotel" | "cafe";

/** Legacy aliases still seen in older calls */
type LegacyType = "farmtotable" | "casa" | "cafe";

/** Map legacy → canonical */
function toCanonical(type: ReservationType | LegacyType): ReservationType {
  if (type === "farmtotable") return "restaurant";
  if (type === "casa") return "hotel";
  return type;
}

type ReservationContextValue = {
  /** modal state */
  isOpen: boolean;
  open: (type?: ReservationType | LegacyType) => void;
  close: () => void;

  /** Back-compat method names (so existing code compiles) */
  openReservationModal: (type?: ReservationType | LegacyType) => void;
  closeReservationModal: () => void;

  /** current tab */
  reservationType: ReservationType;
  setReservationType: (type: ReservationType | LegacyType) => void;
};

/** Null by default – enforces provider usage (no `as any`) */
const ReservationContext = createContext<ReservationContextValue | null>(null);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  // Start on "restaurant" to match previous behavior
  const [reservationType, _setType] = useState<ReservationType>("restaurant");
  const [isOpen, setIsOpen] = useState(false);

  const setReservationType = (t: ReservationType | LegacyType) => {
    _setType(toCanonical(t));
  };

  const open = (t?: ReservationType | LegacyType) => {
    if (t) _setType(toCanonical(t));
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  // Back-compat names
  const openReservationModal = (t?: ReservationType | LegacyType) => open(t);
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

/** Guarded consumer – throws if used outside provider (like SharedTransition) */
export function useReservation(): ReservationContextValue {
  const ctx = useContext(ReservationContext);
  if (!ctx) {
    throw new Error("useReservation must be used within <ReservationProvider>");
  }
  return ctx;
}
