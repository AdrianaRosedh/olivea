"use client";

import { Calendar, MessageSquare } from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";

export function MobileNav() {
  const { openReservationModal } = useReservation();

  return (
    <div className="fixed bottom-16 right-3 z-50 flex flex-col gap-2 md:hidden">
      {/* Reserve Button (smaller, lower) */}
      <button
        id="reserve-toggle"
        onClick={() => openReservationModal()}
        className="flex flex-col items-center justify-center rounded-[60%_40%_70%_30%] bg-[var(--olivea-olive)] text-white shadow-md px-2 py-1.5 transition-transform active:scale-95"
        aria-label="Reserve"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Reserve</span>
      </button>

      {/* Chat Button (smaller, lower) */}
      <button
        id="chatbot-toggle"
        onClick={() => window.dispatchEvent(new Event("open-chat"))}
        className="flex flex-col items-center justify-center rounded-[40%_60%_30%_70%] bg-[var(--olivea-shell)] text-[var(--olivea-olive)] shadow-md px-2 py-1.5 transition-transform active:scale-95"
        aria-label="Chat"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Chat</span>
      </button>
    </div>
  );
}
