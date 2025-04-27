"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import ReservationModal from "@/components/reservation/ReservationModal"

type ReservationType = "restaurant" | "hotel" | "cafe"

interface ReservationContextType {
  openReservationModal: (type?: ReservationType) => void
  closeReservationModal: () => void
  isModalOpen: boolean
  reservationType: ReservationType
}

// Create context with default values to avoid undefined errors
const ReservationContext = createContext<ReservationContextType>({
  openReservationModal: () => {},
  closeReservationModal: () => {},
  isModalOpen: false,
  reservationType: "restaurant",
})

export function ReservationProvider({ children, lang }: { children: ReactNode; lang: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reservationType, setReservationType] = useState<ReservationType>("restaurant")

  const openReservationModal = (type: ReservationType = "restaurant") => {
    console.log(`[ReservationContext] Opening modal with type: ${type}`)
    setReservationType(type)
    setIsModalOpen(true)
  }

  const closeReservationModal = () => {
    console.log("[ReservationContext] Closing modal")
    setIsModalOpen(false)
  }

  // Create the context value object
  const contextValue = {
    openReservationModal,
    closeReservationModal,
    isModalOpen,
    reservationType,
  }

  return (
    <ReservationContext.Provider value={contextValue}>
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

  // No need to throw an error, as we've provided default values
  return context
}
