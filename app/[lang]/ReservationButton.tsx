"use client"

import MagneticButton from "@/components/ui/MagneticButton"
import { Button } from "@/components/ui/button"
import { useReservation } from "@/contexts/ReservationContext"

export default function ReservationButton() {    
  const { openReservationModal } = useReservation()

  return (
    <>
      {/* Mobile Button */}
      <div className="md:hidden w-full px-4">
        <Button
          onClick={openReservationModal}
          size="lg"
          className="w-full h-[60px] text-base rounded-xl bg-[var(--olivea-clay)] text-white hover:bg-[var(--olivea-clay)] transition-colors shadow-md font-sans"
        >
          Reservar
        </Button>
      </div>

      {/* Desktop Magnetic Button */}
      <div className="hidden md:block">
        <MagneticButton
          onClick={openReservationModal}
          className="px-6 py-3 text-white bg-[var(--olivea-olive)] hover:bg-[var(--olivea-clay)] rounded-md transition-colors font-sans"
        >
          Reservar
        </MagneticButton>
      </div>
    </>
  )
}