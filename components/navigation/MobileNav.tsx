// components/navigation/MobileNav.tsx
"use client";

import { Calendar, MessageSquare } from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReservationType } from "@/contexts/ReservationContext";

export function MobileNav() {
  const { openReservationModal } = useReservation();
  const pathname = usePathname();
  const [chatAvailable, setChatAvailable] = useState(false);

  // pick the initial tab based on URL
  const reserveTab: ReservationType = pathname?.includes("/casa")
    ? "hotel"
    : pathname?.includes("/cafe")
      ? "cafe"
      : "restaurant";

  useEffect(() => {
    const updateChat = () => {
      const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Tijuana",
        hour12: false,
      });
      const d = new Date(now);
      const minutes = d.getHours() * 60 + d.getMinutes();
      setChatAvailable(minutes >= 8 * 60 && minutes <= 21 * 60 + 30);
    };
    updateChat();
    const id = setInterval(updateChat, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-16 right-3 z-50 flex flex-col gap-2 md:hidden">
      {/* Reserve button */}
      <button
        id="reserve-toggle"
        onClick={() => openReservationModal(reserveTab)}
        className="flex flex-col items-center justify-center rounded-[60%_40%_70%_30%]
                   bg-[var(--olivea-olive)] text-white shadow-md px-2 py-1.5
                   transition-transform active:scale-95"
        aria-label="Reserve"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">Reserve</span>
      </button>

      {/* Chat button */}
      <button
        id="mobile-chat-button"
        onClick={() => document.getElementById("chatbot-toggle")?.click()}
        className="relative flex flex-col items-center justify-center
                   rounded-[40%_60%_30%_70%] bg-[var(--olivea-shell)]
                   text-[var(--olivea-olive)] shadow-md px-2 py-1.5
                   transition-transform active:scale-95"
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