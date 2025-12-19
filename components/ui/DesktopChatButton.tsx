"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

interface DesktopChatButtonProps {
  lang: "en" | "es";
  avoidSelector?: string;
}

function seededBlobRadius(seed: string) {
  // deterministic organic radius (so it feels designed, not random each reload)
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return 40 + (h % 21); // 40–60
  };
  const p = () => `${rand()}%`;
  return `${p()} ${p()} ${p()} ${p()} / ${p()} ${p()} ${p()} ${p()}`;
}

export default function DesktopChatButton({ lang, avoidSelector }: DesktopChatButtonProps) {
  const [chatAvailable, setChatAvailable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [extraBottom, setExtraBottom] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // stable, organic radius
  const blobRadius = useMemo(() => seededBlobRadius("olivea-chat"), []);

  /** Whistle helpers */
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

  useEffect(() => {
    setWhistleInteractive(false);
    return () => setWhistleInteractive(false);
  }, [setWhistleInteractive]);

  const isWhistleOpen = useCallback((host: HTMLElement | null) => {
    if (!host) return false;
    const cs = getComputedStyle(host);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity || "1") < 0.05) return false;
    const r = host.getBoundingClientRect();
    return r.width >= 300 && r.height >= 300;
  }, []);

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

  /** Availability */
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

  /** Dynamic offset to avoid overlap */
  useEffect(() => {
    const candidates = [
      avoidSelector,
      "[data-lang-switcher]",
      "#lang-switcher",
      ".lang-switcher",
      "[data-whistle-launcher]",
      "#whistle-widget",
      ".whistle-launcher",
      '[data-widget="whistle"]',
    ].filter(Boolean) as string[];

    function computeOffset() {
      const host = rootRef.current;
      if (!host) return;

      const selfRect = host.getBoundingClientRect();
      const target =
        candidates.map((sel) => document.querySelector<HTMLElement>(sel))
          .find((el) => el && el.offsetParent !== null) ?? null;

      if (!target) { setExtraBottom(0); return; }

      const tRect = target.getBoundingClientRect();
      const horizontallyOverlaps = tRect.left < selfRect.right && tRect.right > selfRect.left;
      const verticallyOverlaps   = tRect.top  < selfRect.bottom && tRect.bottom > selfRect.top;

      if (horizontallyOverlaps && verticallyOverlaps) {
        const neededLift = Math.ceil(selfRect.bottom - tRect.top) + 12;
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
      const n = document.querySelector<HTMLElement>(sel);
      if (n) ro.observe(n);
    });

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", computeOffset);
      window.removeEventListener("scroll",  computeOffset);
    };
  }, [avoidSelector]);

  /** Labels */
  const labels = {
    en: { available: "Live Chat — Available", unavailable: "Chat — Out of Office Hours", open: "Open Chat" },
    es: { available: "Chat en Vivo — Disponible", unavailable: "Chat — Fuera de Horario", open: "Abrir Chat" },
  };
  const currentLabel = chatAvailable ? labels[lang].available : labels[lang].unavailable;

  /** Click */
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

  // Position: higher + more right than your previous (and still safe-area aware)
  const BASE_BOTTOM = 92; // a bit higher than 80
  const BASE_RIGHT  = 32; // a bit more right than 24

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
          preset="classic"
          magnetDistancePx={12}
          stiffness={200}
          damping={16}
          hoverScale={1.06}
          aria-label={labels[lang].open}
          onClick={handleClick}
          className={cn(
            "relative w-14 h-14 text-(--olivea-cream)",
            // ✅ Olivea base + hover
            "bg-(--olivea-olive) hover:bg-(--olivea-clay)",
            // ✅ organic shape (deterministic)
            "shadow-[0_18px_44px_-28px_rgba(0,0,0,0.6)]",
            "transition-colors"
          )}
          style={{ borderRadius: blobRadius }}
        >
          <MessageCircle className="w-7 h-7" />

          {/* Availability bulb: functional + visible */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute block rounded-full shadow-sm",
              // higher + more right (slightly outside the button like a pin)
              "-top-1 -right-1",
              "h-2.5 w-2.5",
              "ring-1.5 ring-(--olivea-cream)",
              chatAvailable
                ? "bg-green-500 animate-pulse"
                : "bg-red-500"
            )}
          />
        </MagneticButton>

        <AnimatePresence mode="wait">
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="
                pointer-events-none
                absolute right-full mr-3 top-1/2 -translate-y-1/2
                px-4 py-2 text-sm rounded-xl
                backdrop-blur-sm
                shadow-[0_18px_42px_-28px_rgba(0,0,0,0.55)]
                border border-(--olivea-olive)/12
                bg-(--olivea-white)/80
                text-(--olivea-olive)
                font-semibold whitespace-nowrap
              "
            >
              {currentLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
