// components/navigation/MobileNav.tsx
"use client";

import { Calendar, MessageSquare } from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReservationType } from "@/contexts/ReservationContext";

type Props = {
  /** Optional: pass from Navbar state so we can hide these buttons when drawer is open */
  isDrawerOpen?: boolean;
};

function getTijuanaMinutesNow(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Tijuana",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hh * 60 + mm;
}

export function MobileNav({ isDrawerOpen }: Props) {
  const { openReservationModal } = useReservation();
  const pathname = usePathname();

  const [chatAvailable, setChatAvailable] = useState(false);
  const [visible, setVisible] = useState(false);

  const lang = useMemo<"es" | "en">(() => {
    if (!pathname) return "es";
    return pathname.startsWith("/en") ? "en" : "es";
  }, [pathname]);

  const labels = useMemo(() => {
    return lang === "es"
      ? { reserve: "Reservar", chat: "Chat" }
      : { reserve: "Reserve", chat: "Chat" };
  }, [lang]);

  // pick the initial tab based on URL
  const reserveTab: ReservationType = pathname?.includes("/casa")
    ? "hotel"
    : pathname?.includes("/cafe")
      ? "cafe"
      : "restaurant";

  const isContentHeavy =
    !!pathname &&
    (pathname.includes("/journal") ||
      pathname.includes("/diario") ||
      pathname.includes("/posts"));

  // Chat availability
  useEffect(() => {
    const updateChat = () => {
      const minutes = getTijuanaMinutesNow();
      setChatAvailable(minutes >= 8 * 60 && minutes <= 21 * 60 + 30);
    };

    updateChat();
    const id = window.setInterval(updateChat, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Reset visibility on route change so buttons don’t show immediately on new pages
  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  // Visibility based on scroll (prevents covering hero/cards at top)
  useEffect(() => {
    // Tune thresholds (keep the “doesn’t appear right away” feeling)
    const threshold = isContentHeavy ? 140 : 110;

    const onScroll = () => {
      const y = window.scrollY || 0;
      setVisible(y > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isContentHeavy]);

  // If drawer is open, hide these so the drawer feels “sole focus”
  if (isDrawerOpen) return null;

  return (
    <div
      className={[
        "fixed md:hidden z-200 flex flex-col gap-2",
        "right-3",
        "bottom-[calc(env(safe-area-inset-bottom,0px)+4.25rem)]",
        "transition-all duration-200 ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none",
        isContentHeavy ? "opacity-90" : "",
      ].join(" ")}
    >
      {/* Reserve */}
      <button
        id="reserve-toggle"
        type="button"
        onClick={() => openReservationModal(reserveTab)}
        className={[
          "flex flex-col items-center justify-center",
          "rounded-[60%_40%_70%_30%]",
          "bg-(--olivea-olive) text-white",
          "ring-1 ring-white/15",
          "shadow-md",
          "px-2 py-1.5",
          "transition-transform active:scale-95",
        ].join(" ")}
        aria-label={labels.reserve}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{labels.reserve}</span>
      </button>

      {/* Chat */}
      <button
        id="mobile-chat-button"
        type="button"
        onClick={() => {
          sessionStorage.setItem("olivea_chat_intent", "1");
          document.body.classList.add("olivea-chat-open");
          const toggleBtn = document.getElementById("chatbot-toggle");
          toggleBtn?.click();

          // Keep ONLY a body flag (used by our overlay + optional CSS)
          document.body.classList.add("olivea-chat-open");
        }}

        className={[
          "relative flex flex-col items-center justify-center",
          "rounded-[40%_60%_30%_70%]",
          "bg-(--olivea-shell) text-(--olivea-olive)",
          "ring-1 ring-black/10",
          "shadow-md",
          "px-2 py-1.5",
          "transition-transform active:scale-95",
        ].join(" ")}
        aria-label={labels.chat}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{labels.chat}</span>

        {/* Availability dot */}
        <span
          aria-hidden="true"
          className={[
            "absolute top-0.5 right-0.5 block h-2 w-2 rounded-full border border-white",
            chatAvailable ? "bg-green-500 animate-pulse" : "bg-red-500",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
