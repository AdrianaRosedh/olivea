"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

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

  // Wrapped so they are stable across renders. They only call setState, so the
  // stale copies the memo captured behaved identically — but the moment one of
  // them reads a prop or piece of state, that stops being true silently. Making
  // them stable lets the memo below list its real dependencies.
  const setReservationType = useCallback((t: ReservationType | LegacyType) => {
    _setType(toCanonical(t));
  }, []);

  const open = useCallback((t?: ReservationType | LegacyType) => {
    if (t) _setType(toCanonical(t));
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  // Back-compat names
  const openReservationModal = useCallback(
    (t?: ReservationType | LegacyType) => open(t),
    [open]
  );
  const closeReservationModal = useCallback(() => close(), [close]);

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
    [isOpen, reservationType, open, close, openReservationModal, closeReservationModal, setReservationType]
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
