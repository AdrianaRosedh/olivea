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

  /** Whether the guest has chosen a house yet: opened from a house's page,
   *  or picked one in the window. When not, phones show the three houses
   *  first instead of dropping the guest into one booking engine. */
  typeChosen: boolean;
  /** Back to the three houses (phones, after closing a booking sheet). */
  chooseAgain: () => void;
};

/** Null by default – enforces provider usage (no `as any`) */
const ReservationContext = createContext<ReservationContextValue | null>(null);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  // Start on "restaurant" to match previous behavior
  const [reservationType, _setType] = useState<ReservationType>("restaurant");
  const [isOpen, setIsOpen] = useState(false);
  const [typeChosen, setTypeChosen] = useState(false);

  // Wrapped so they are stable across renders. They only call setState, so the
  // stale copies the memo captured behaved identically — but the moment one of
  // them reads a prop or piece of state, that stops being true silently. Making
  // them stable lets the memo below list its real dependencies.
  const setReservationType = useCallback((t: ReservationType | LegacyType) => {
    _setType(toCanonical(t));
    setTypeChosen(true);
  }, []);

  // Without a type (a page that belongs to no house, like the home page) the
  // guest chooses; the last tab stays as the desktop default.
  const open = useCallback((t?: ReservationType | LegacyType) => {
    if (t) _setType(toCanonical(t));
    setTypeChosen(Boolean(t));
    setIsOpen(true);
  }, []);

  const chooseAgain = useCallback(() => setTypeChosen(false), []);

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
      typeChosen,
      chooseAgain,
    }),
    [isOpen, reservationType, typeChosen, open, close, openReservationModal, closeReservationModal, setReservationType, chooseAgain]
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
