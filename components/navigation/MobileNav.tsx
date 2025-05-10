"use client";

import { Calendar, MessageSquare } from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";

export function MobileNav() {
  const { openReservationModal } = useReservation();

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3 md:hidden">
      {/* Reserve Button (Icon + Label below) */}
      <button
        id="reserve-toggle"
        onClick={() => openReservationModal()}
        className="flex flex-col items-center justify-center rounded-[60%_40%_70%_30%] bg-[var(--olivea-olive)] text-white shadow-lg px-3 py-2 transition-transform active:scale-95"
        aria-label="Reserve"
      >
        <Calendar className="w-6 h-6" />
        <span className="text-xs font-medium mt-1">Reserve</span>
      </button>

      {/* Chat Button (Icon + Label below) */}
      <button
        id="chatbot-toggle"
        onClick={() => window.dispatchEvent(new Event("open-chat"))}
        className="flex flex-col items-center justify-center rounded-[40%_60%_30%_70%] bg-[var(--olivea-shell)] text-[var(--olivea-olive)] shadow-lg px-3 py-2 transition-transform active:scale-95"
        aria-label="Chat"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="text-xs font-medium mt-1">Chat</span>
      </button>
    </div>
  );
}
