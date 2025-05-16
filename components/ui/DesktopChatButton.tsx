"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

interface DesktopChatButtonProps {
  lang: "en" | "es";
}

export default function DesktopChatButton({ lang }: DesktopChatButtonProps) {
  const [chatAvailable, setChatAvailable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Check chat availability
  useEffect(() => {
    const updateAvailability = () => {
      const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Tijuana",
        hour12: false,
      });
      const minutesNow = new Date(now).getHours() * 60 + new Date(now).getMinutes();
      setChatAvailable(minutesNow >= 480 && minutesNow <= 1290); // 8:00 AM to 9:30 PM
    };

    updateAvailability();
    const interval = setInterval(updateAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const labels = {
    en: {
      available: "Live Chat - Available",
      unavailable: "Chat - Out of Office Hours",
    },
    es: {
      available: "Chat en Vivo - Disponible",
      unavailable: "Chat - Fuera de Horario",
    },
  };

  const currentLabel = chatAvailable ? labels[lang].available : labels[lang].unavailable;

  return (
    <div className="fixed bottom-20 right-6 z-50 hidden md:block">
      <div
        className="relative"
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <MagneticButton
          aria-label="Open Chat"
          className="relative w-14 h-14 bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] rounded-[40%_60%_60%_40%]"
          onClick={() => {
            const chatbotToggle = document.getElementById('chatbot-toggle');
            if (chatbotToggle) chatbotToggle.click();
          }}
        >
          <MessageCircle className="w-7 h-7" />
          
          {/* Availability dot positioned clearly on top-right */}
          <span
            className={`absolute top-[-4px] right-[-4px] block h-2.5 w-2.5 rounded-full ${
              chatAvailable ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
        </MagneticButton>
  
        <AnimatePresence mode="wait">
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-4 py-2 text-sm rounded-lg backdrop-blur-sm shadow-md border border-[var(--olivea-olive)]/10 bg-[var(--olivea-white)] text-[var(--olivea-olive)] font-semibold whitespace-nowrap"
              style={{ top: "50%", transform: "translateY(-50%)" }} // ⟵ Add this
            >
              {currentLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );  
}