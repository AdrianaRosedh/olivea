// contexts/ReservationContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import ReservationModal from "@/components/forms/reservation/ReservationModal";

export type ReservationType = "restaurant" | "hotel" | "cafe";

interface ReservationContextType {
  openReservationModal: (type?: ReservationType) => void;
  closeReservationModal: () => void;
  setReservationType: (type: ReservationType) => void;     // ← new
  isOpen: boolean;
  reservationType: ReservationType;
}

const ReservationContext = createContext<ReservationContextType>({
  openReservationModal: () => {},
  closeReservationModal: () => {},
  setReservationType: () => {},                             // ← dummy
  isOpen: false,
  reservationType: "restaurant",
});

export function ReservationProvider({
  children,
  lang,
}: {
  children: ReactNode;
  lang: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reservationType, _setReservationType] =
    useState<ReservationType>("restaurant");

  const openReservationModal = useCallback(
    (type: ReservationType = "restaurant") => {
      _setReservationType(type);
      setIsOpen(true);
    },
    []
  );

  const closeReservationModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // New function that simply changes the tab
  const setReservationType = useCallback((type: ReservationType) => {
    _setReservationType(type);
  }, []);

  return (
    <ReservationContext.Provider
      value={{
        openReservationModal,
        closeReservationModal,
        setReservationType,            // ← provide it here
        isOpen,
        reservationType,
      }}
    >
      {children}
      <ReservationModal lang={lang} />
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  return useContext(ReservationContext);
}