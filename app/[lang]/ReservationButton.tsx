// components/ReservationButton.tsx
"use client";

import MagneticButton from "@/components/ui/MagneticButton";
import { Button } from "@/components/ui/button";
import { useReservation } from "@/contexts/ReservationContext";

interface ReservationButtonProps {
  /** Optional extra classes to apply to both mobile and desktop wrappers */
  className?: string;
}

export default function ReservationButton({ className = "" }: ReservationButtonProps) {
  const { openReservationModal } = useReservation();

  return (
    <>
      {/* Mobile Button */}
      <div className={`md:hidden w-full px-4 pt-4 ${className}`}>
        <Button
          onClick={() => openReservationModal()}
          size="lg"
          className="w-full h-[60px] text-base rounded-xl bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] transition-colors shadow-md font-sans"
        >
          Reservar
        </Button>
      </div>

      {/* Desktop Magnetic Button */}
      <div className={`hidden md:block ${className}`}>
        <MagneticButton
          onClick={() => openReservationModal()}
          className="px-6 py-3 text-white bg-[var(--olivea-olive)] hover:bg-[var(--olivea-clay)] rounded-md transition-colors font-sans"
        >
          Reservar
        </MagneticButton>
      </div>
    </>
  );
}