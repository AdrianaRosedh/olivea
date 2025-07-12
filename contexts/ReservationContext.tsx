"use client";

import React, { createContext, useContext, useState } from "react";

export type ReservationType = "restaurant" | "hotel" | "cafe";

interface ReservationContextType {
  isOpen: boolean;
  reservationType: ReservationType;
  openReservationModal: (type?: ReservationType) => void;
  closeReservationModal: () => void;
  setReservationType: (type: ReservationType) => void;
}

const ReservationContext = createContext<ReservationContextType>({} as any);

export const ReservationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reservationType, setReservationType] = useState<ReservationType>("restaurant");

  const openReservationModal = (type: ReservationType = "restaurant") => {
    setReservationType(type);
    setIsOpen(true);
  };
  const closeReservationModal = () => setIsOpen(false);

  return (
    <ReservationContext.Provider
      value={{ isOpen, reservationType, openReservationModal, closeReservationModal,setReservationType }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => useContext(ReservationContext);