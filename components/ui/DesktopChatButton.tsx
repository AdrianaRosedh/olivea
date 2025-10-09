// components/ui/DesktopChatButton.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

interface DesktopChatButtonProps {
  lang: "en" | "es";
  /** Optional: CSS selector of the element to avoid (e.g., your language button). Defaults try common ones. */
  avoidSelector?: string;
}

export default function DesktopChatButton({ lang, avoidSelector }: DesktopChatButtonProps) {
  const [chatAvailable, setChatAvailable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [extraBottom, setExtraBottom] = useState(0); // dynamic lift to avoid overlap
  const rootRef = useRef<HTMLDivElement>(null);

  // --- Availability (kept) ---
  useEffect(() => {
    const updateAvailability = () => {
      const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Tijuana",
        hour12: false,
      });
      const dt = new Date(now);
      const minutesNow = dt.getHours() * 60 + dt.getMinutes();
      setChatAvailable(minutesNow >= 480 && minutesNow <= 1290);
    };
    updateAvailability();
    const interval = setInterval(updateAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Dynamic offset to avoid overlapping with language button / whistle ---
  useEffect(() => {
    // Try multiple selectors if none passed
    const candidates = [
      avoidSelector,
      '[data-lang-switcher]',
      '#lang-switcher',
      '.lang-switcher',
      '[data-whistle-launcher]',
      '#whistle-widget',
      '.whistle-launcher',
      '[data-widget="whistle"]',
    ].filter(Boolean) as string[];

    function computeOffset() {
      const host = rootRef.current;
      if (!host) return;

      // Our button box (where it is right now)
      const selfRect = host.getBoundingClientRect();

      // Find the first visible candidate to avoid
      const target = candidates
        .map((sel) => document.querySelector<HTMLElement>(sel!))
        .find((el) => el && el.offsetParent !== null) ?? null;

      if (!target) {
        setExtraBottom(0);
        return;
      }

      const tRect = target.getBoundingClientRect();

      // If the target sits within our horizontal lane near bottom-right, lift us above it.
      const horizontallyOverlaps = tRect.left < selfRect.right && tRect.right > selfRect.left;
      const verticallyOverlaps = tRect.top < selfRect.bottom && tRect.bottom > selfRect.top;

      if (horizontallyOverlaps && verticallyOverlaps) {
        const neededLift = Math.ceil(selfRect.bottom - tRect.top) + 12; // 12px breathing room
        setExtraBottom((v) => Math.max(v, neededLift));
      } else {
        setExtraBottom(0);
      }
    }

    // Recompute on resize / scroll / DOM mutations
    const ro = new ResizeObserver(computeOffset);
    const mo = new MutationObserver(computeOffset);

    computeOffset();
    window.addEventListener("resize", computeOffset, { passive: true });
    window.addEventListener("scroll", computeOffset, { passive: true });
    mo.observe(document.body, { childList: true, subtree: true });

    // Observe candidate if present
    candidates.forEach((sel) => {
      const n = document.querySelector<HTMLElement>(sel!);
      if (n) ro.observe(n);
    });

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", computeOffset);
      window.removeEventListener("scroll", computeOffset);
    };
  }, [avoidSelector]);

  const labels = {
    en: { available: "Live Chat — Available", unavailable: "Chat — Out of Office Hours", open: "Open Chat" },
    es: { available: "Chat en Vivo — Disponible", unavailable: "Chat — Fuera de Horario", open: "Abrir Chat" },
  };
  const currentLabel = chatAvailable ? labels[lang].available : labels[lang].unavailable;

  const handleClick = () => {
    const globalToggle = document.getElementById("chatbot-toggle");
    if (globalToggle) globalToggle.click();
  };

  // Base position (matches your old bottom-20 right-6 on md+):
  const BASE_BOTTOM = 80; // px (Tailwind bottom-20)
  const BASE_RIGHT  = 24; // px (right-6)

  return (
    <div
      ref={rootRef}
      // fixed, md+ only, with safe-area and dynamic lifting to clear other UI
      className="fixed z-60 hidden md:block"
      style={{
        right: `max(${BASE_RIGHT}px, env(safe-area-inset-right))`,
        bottom: `calc(max(${BASE_BOTTOM}px, env(safe-area-inset-bottom)) + ${extraBottom}px)`,
      }}
    >
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <MagneticButton
          aria-label={labels[lang].open}
          className="relative w-14 h-14 bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] rounded-[40%_60%_60%_40%] shadow-lg"
          onClick={handleClick}
        >
          <MessageCircle className="w-7 h-7" />
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
            >
              {currentLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}