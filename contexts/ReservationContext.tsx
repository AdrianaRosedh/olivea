"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import ReservationModal from "@/components/reservation/ReservationModal"

type ReservationType = "restaurant" | "hotel" | "cafe"

interface ReservationContextType {
  openReservationModal: (type?: ReservationType) => void
  closeReservationModal: () => void
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined)

export function ReservationProvider({ children, lang }: { children: ReactNode; lang: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reservationType, setReservationType] = useState<ReservationType>("restaurant")

  const openReservationModal = (type: ReservationType = "restaurant") => {
    setReservationType(type)
    setIsModalOpen(true)
  }

  const closeReservationModal = () => {
    setIsModalOpen(false)
  }

  return (
    <ReservationContext.Provider value={{ openReservationModal, closeReservationModal }}>
      {children}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={closeReservationModal}
        initialType={reservationType}
        lang={lang}
      />
    </ReservationContext.Provider>
  )
}

export function useReservation() {
  const context = useContext(ReservationContext)
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider")
  }
  return context
}
