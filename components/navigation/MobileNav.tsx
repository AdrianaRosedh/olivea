"use client";

import { Calendar, MessageSquare } from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";
import { useEffect, useState } from "react";

export function MobileNav() {
  const { openReservationModal } = useReservation();
  const [chatAvailable, setChatAvailable] = useState(false);

  useEffect(() => {
    const updateChatAvailability = () => {
      const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Tijuana",
        hour12: false,
      });
      const hourMinute = new Date(now).getHours() * 60 + new Date(now).getMinutes();
      const chatStart = 8 * 60; // 8:00 AM
      const chatEnd = 21 * 60 + 30; // 9:30 PM

      setChatAvailable(hourMinute >= chatStart && hourMinute <= chatEnd);
    };

    updateChatAvailability();
    const timer = setInterval(updateChatAvailability, 60 * 1000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-16 right-3 z-50 flex flex-col gap-2 md:hidden">
      {/* Reserve Button */}
      <button
        id="reserve-toggle"
        onClick={() => openReservationModal()}
        className="flex flex-col items-center justify-center rounded-[60%_40%_70%_30%] bg-[var(--olivea-olive)] text-white shadow-md px-2 py-1.5 transition-transform active:scale-95"
        aria-label="Reserve"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Reserve</span>
      </button>

      {/* Chat Button with status indicator */}
      <button
        id="chatbot-toggle"
        onClick={() => window.dispatchEvent(new Event("open-chat"))}
        className="relative flex flex-col items-center justify-center rounded-[40%_60%_30%_70%] bg-[var(--olivea-shell)] text-[var(--olivea-olive)] shadow-md px-2 py-1.5 transition-transform active:scale-95"
        aria-label="Chat"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Chat</span>
        <span
          className={`absolute top-0 right-0 block h-2 w-2 rounded-full border border-white ${
            chatAvailable ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
      </button>
    </div>
  );
}
