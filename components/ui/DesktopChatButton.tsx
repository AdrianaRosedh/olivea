// components/ui/DesktopChatButton.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

  /** ------------------------------------------------------------------------
   * Whistle host helpers (stable)
   * --------------------------------------------------------------------- */
  const getWhistleHost = useCallback(
    () => document.getElementById("w-live-chat") as HTMLElement | null,
    []
  );

  const setWhistleInteractive = useCallback(
    (enabled: boolean) => {
      const host = getWhistleHost();
      if (!host) return;
      host.style.pointerEvents = enabled ? "auto" : "none";
      host.style.zIndex = enabled ? "2147483645" : "";
      document.body.classList.toggle("olivea-chat-open", enabled);
    },
    [getWhistleHost]
  );

  // Make the widget click-through by default.
  useEffect(() => {
    setWhistleInteractive(false);
    return () => setWhistleInteractive(false);
  }, [setWhistleInteractive]);

  // Heuristic: treat iframe as open only when it's a visible large panel.
  const isWhistleOpen = useCallback(
    (host: HTMLElement | null) => {
      if (!host) return false;
      const cs = getComputedStyle(host);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity || "1") < 0.05) return false;
      const r = host.getBoundingClientRect();
      return r.width >= 300 && r.height >= 300;
    },
    []
  );

  // Keep interactivity in sync with panel state (open vs. minimized/closed).
  useEffect(() => {
    const host = getWhistleHost();
    if (!host) return;

    const sync = () => setWhistleInteractive(isWhistleOpen(getWhistleHost()));

    const mo = new MutationObserver(sync);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });

    const ro = new ResizeObserver(sync);
    ro.observe(document.documentElement);
    const h = getWhistleHost();
    if (h) ro.observe(h);

    const interval = setInterval(sync, 2000);

    sync();
    return () => {
      mo.disconnect();
      ro.disconnect();
      clearInterval(interval);
    };
  }, [getWhistleHost, isWhistleOpen, setWhistleInteractive]);

  /** ------------------------------------------------------------------------
   * Availability (kept)
   * --------------------------------------------------------------------- */
  useEffect(() => {
    const updateAvailability = () => {
      const now = new Date().toLocaleString("en-US", { timeZone: "America/Tijuana", hour12: false });
      const dt = new Date(now);
      const minutesNow = dt.getHours() * 60 + dt.getMinutes();
      setChatAvailable(minutesNow >= 480 && minutesNow <= 1290);
    };
    updateAvailability();
    const interval = setInterval(updateAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  /** ------------------------------------------------------------------------
   * Dynamic offset to avoid overlapping with language button / whistle
   * --------------------------------------------------------------------- */
  useEffect(() => {
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

      const selfRect = host.getBoundingClientRect();
      const target =
        candidates.map((sel) => document.querySelector<HTMLElement>(sel!))
          .find((el) => el && el.offsetParent !== null) ?? null;

      if (!target) { setExtraBottom(0); return; }

      const tRect = target.getBoundingClientRect();
      const horizontallyOverlaps = tRect.left < selfRect.right && tRect.right > selfRect.left;
      const verticallyOverlaps   = tRect.top  < selfRect.bottom && tRect.bottom > selfRect.top;

      if (horizontallyOverlaps && verticallyOverlaps) {
        const neededLift = Math.ceil(selfRect.bottom - tRect.top) + 12; // 12px breathing room
        setExtraBottom((v) => Math.max(v, neededLift));
      } else {
        setExtraBottom(0);
      }
    }

    const ro = new ResizeObserver(computeOffset);
    const mo = new MutationObserver(computeOffset);

    computeOffset();
    window.addEventListener("resize", computeOffset, { passive: true });
    window.addEventListener("scroll",  computeOffset, { passive: true });
    mo.observe(document.body, { childList: true, subtree: true });

    candidates.forEach((sel) => {
      const n = document.querySelector<HTMLElement>(sel!);
      if (n) ro.observe(n);
    });

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", computeOffset);
      window.removeEventListener("scroll",  computeOffset);
    };
  }, [avoidSelector]);

  /** ------------------------------------------------------------------------
   * Labels
   * --------------------------------------------------------------------- */
  const labels = {
    en: { available: "Live Chat — Available", unavailable: "Chat — Out of Office Hours", open: "Open Chat" },
    es: { available: "Chat en Vivo — Disponible", unavailable: "Chat — Fuera de Horario", open: "Abrir Chat" },
  };
  const currentLabel = chatAvailable ? labels[lang].available : labels[lang].unavailable;

  /** ------------------------------------------------------------------------
   * Click: open Whistle, then poll briefly to re-sync during animation
   * --------------------------------------------------------------------- */
  const handleClick = () => {
    const globalToggle = document.getElementById("chatbot-toggle");
    setWhistleInteractive(true);
    globalToggle?.click();

    const start = performance.now();
    const tick = () => {
      const host = getWhistleHost();
      setWhistleInteractive(isWhistleOpen(host));
      if (performance.now() - start < 4000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Base position (matches your old bottom-20 right-6 on md+):
  const BASE_BOTTOM = 80; // px (Tailwind bottom-20)
  const BASE_RIGHT  = 24; // px (right-6)

  return (
    <div
      ref={rootRef}
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
        // ✅ same lively motion as your Reserve buttons
        preset="classic"            // dist=12, stiffness=200, damping=16, hoverScale=1.07
        magnetDistancePx={12}       // you can tweak to 10/14 if you want
        stiffness={200}
        damping={16}
        hoverScale={1.07}
          
        // accessibility + visuals
        aria-label={labels[lang].open}
        className="relative w-14 h-14 bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] rounded-[40%_60%_60%_40%] shadow-lg"
          
        onClick={handleClick}
      >
        {/* The whole payload (icon + status dot) now reacts with the same subtle tilt/scale */}
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