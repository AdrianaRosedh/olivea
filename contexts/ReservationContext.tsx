"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import ReservationModal from "@/components/forms/reservation/ReservationModal"

type ReservationType = "restaurant" | "hotel" | "cafe"

interface ReservationContextType {
  openReservationModal: (type?: ReservationType) => void
  closeReservationModal: () => void
  isOpen: boolean
  reservationType: ReservationType
}

const ReservationContext = createContext<ReservationContextType>({
  openReservationModal: () => {},
  closeReservationModal: () => {},
  isOpen: false,
  reservationType: "restaurant",
})

export function ReservationProvider({
  children,
  lang,
}: {
  children: ReactNode
  lang: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [reservationType, setReservationType] =
    useState<ReservationType>("restaurant")

  const openReservationModal = useCallback(
    (type: ReservationType = "restaurant") => {
      setReservationType(type)
      setIsOpen(true)
    },
    []
  )

  const closeReservationModal = useCallback(() => {
      setIsOpen(false)
    },
    []
  )

  return (
    <ReservationContext.Provider
      value={{ openReservationModal, closeReservationModal, isOpen, reservationType }}
    >
      {children}

      {/* mount the modal once here */}
      <ReservationModal
        initialType={reservationType}
        lang={lang}
      />
    </ReservationContext.Provider>
  )
}

export function useReservation() {
  return useContext(ReservationContext)
}