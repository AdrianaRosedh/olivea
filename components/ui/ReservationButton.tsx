// components/ui/ReservationButton.tsx
"use client";

import MagneticButton from "@/components/ui/MagneticButton";
import { Button }          from "@/components/ui/button";
import { useReservation }  from "@/contexts/ReservationContext";

interface ReservationButtonProps {
  className?: string;
}

export default function ReservationButton({ className = "" }: ReservationButtonProps) {
  const { openReservationModal } = useReservation();

  const handleClick = () => {
    // tells context to open the modal (with whatever type you want)
    openReservationModal("restaurant");
  };

  return (
    <>
      {/* Mobile Button */}
      <div className={`md:hidden w-full px-4 pt-4 ${className}`}>
        <Button
          onClick={handleClick}
          size="lg"
          className="w-full h-[60px] text-base rounded-xl bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] transition-colors shadow-md font-sans tracking-wider"
        >
          RESERVAR
        </Button>
      </div>

      {/* Desktop Magnetic Button */}
      <div className={`hidden md:block ${className}`}>
        <MagneticButton
          onClick={handleClick}
          className="px-6 py-3 text-white bg-[var(--olivea-olive)] hover:bg-[var(--olivea-clay)] rounded-md transition-colors font-sans tracking-wider"
        >
          RESERVAR
        </MagneticButton>
      </div>
    </>
  );
}
