// components/navigation/MobileNav.tsx
"use client";

import {
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReservationType } from "@/contexts/ReservationContext";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useDragControls,
} from "framer-motion";
import { track } from "@vercel/analytics";

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

type DockPos = { side: "left" | "right"; y: number };

export function MobileNav({ isDrawerOpen }: Props) {
  const { openReservationModal } = useReservation();
  const pathname = usePathname();

  const [chatAvailable, setChatAvailable] = useState(false);
  const [visible, setVisible] = useState(false);

  // collapsed by default; expands on tap
  const [expanded, setExpanded] = useState(false);

  // long-press to drag (now via dragControls.start())
  const [dragEnabled, setDragEnabled] = useState(false);
  const pressTimerRef = useRef<number | null>(null);
  const pressedRef = useRef(false);
  const movedRef = useRef(false);
  const startPtRef = useRef<{ x: number; y: number } | null>(null);

  // one-time tooltip hint
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef<number | null>(null);

  // anchored side + remembered Y offset
  const [pos, setPos] = useState<DockPos>(() => ({ side: "right", y: 0 }));

  // Motion values for smooth dragging
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);

  // Drag controls (required for long-press drag on iOS)
  const dragControls = useDragControls();

  // Constraint measurement refs
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);

  const [constraints, setConstraints] = useState<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  } | null>(null);

  const lang = useMemo<"es" | "en">(() => {
    if (!pathname) return "es";
    return pathname.startsWith("/en") ? "en" : "es";
  }, [pathname]);

  const labels = useMemo(() => {
    return lang === "es"
      ? {
          reserve: "Reservar",
          chat: "Chat",
          actions: "Acciones",
          hint: "Mantén presionado para mover",
        }
      : {
          reserve: "Reserve",
          chat: "Chat",
          actions: "Actions",
          hint: "Hold to move",
        };
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

  /* ---------------- chat availability ---------------- */
  useEffect(() => {
    const updateChat = () => {
      const minutes = getTijuanaMinutesNow();
      setChatAvailable(minutes >= 8 * 60 && minutes <= 21 * 60 + 30);
    };

    updateChat();
    const id = window.setInterval(updateChat, 60_000);
    return () => window.clearInterval(id);
  }, []);

  /* ---------------- restore position ---------------- */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("olivea_mobile_dock_pos_v5");
      if (!raw) return;
      const parsed = JSON.parse(raw) as DockPos;
      if (!parsed) return;
      if (parsed.side !== "left" && parsed.side !== "right") return;
      if (typeof parsed.y !== "number") return;

      setPos(parsed);
      mvY.set(parsed.y);
      mvX.set(0);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- reset on route change ---------------- */
  useEffect(() => {
    setVisible(false);
    setExpanded(false);
    setDragEnabled(false);
    setShowHint(false);

    if (hintTimerRef.current) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }

    mvX.set(0);
    mvY.set(pos.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* ---------------- visibility based on scroll ---------------- */
  useEffect(() => {
    const threshold = isContentHeavy ? 140 : 110;

    const onScroll = () => {
      const y = window.scrollY || 0;
      setVisible(y > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isContentHeavy]);

  /* ---------------- show hint once per session ---------------- */
  useEffect(() => {
    if (!visible) return;

    const key = "olivea_mobile_dock_hint_seen_v1";
    const seen = sessionStorage.getItem(key);
    if (seen) return;

    const t = window.setTimeout(() => {
      setShowHint(true);
      sessionStorage.setItem(key, "1");

      hintTimerRef.current = window.setTimeout(() => {
        setShowHint(false);
        hintTimerRef.current = null;
      }, 2800);
    }, 500);

    return () => window.clearTimeout(t);
  }, [visible]);

  /* ---------------- measure drag constraints ---------------- */
  const measureConstraints = () => {
    const wrap = wrapRef.current;
    const dock = dockRef.current;
    if (!wrap || !dock) return null;

    const w = wrap.getBoundingClientRect();
    const d = dock.getBoundingClientRect();

    const padX = 8;
    const padTop = 12;
    const padBottom = 12;

    const left = -w.left + padX;
    const right = window.innerWidth - (w.left + d.width) - padX;

    const top = -w.top + padTop;
    const bottom = window.innerHeight - (w.top + d.height) - padBottom;

    return { left, right, top, bottom };
  };

  useEffect(() => {
    if (!visible) return;

    const recalc = () => {
      requestAnimationFrame(() => setConstraints(measureConstraints()));
    };

    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("orientationchange", recalc);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", recalc);
    };
  }, [visible, expanded, pos.side]);

  // When side changes, keep y and reset x
  useEffect(() => {
    mvX.set(0);
    mvY.set(pos.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.side]);

  /* ---------------- long-press helpers ---------------- */
  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const endPress = () => {
    clearPressTimer();
    pressedRef.current = false;
    startPtRef.current = null;

    // If we didn't actually drag, turn off drag mode immediately
    if (!movedRef.current) setDragEnabled(false);

    movedRef.current = false;
  };

  // If drawer is open, hide dock
  if (isDrawerOpen) return null;

  const sideRight = pos.side === "right";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={wrapRef}
          className={[
            "fixed md:hidden z-200",
            "bottom-[calc(env(safe-area-inset-bottom,0px)+4.25rem)]",
            sideRight ? "right-3" : "left-3",
            isContentHeavy ? "opacity-90" : "",
          ].join(" ")}
          initial={{ opacity: 0, x: sideRight ? 40 : -40, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: sideRight ? 40 : -40, y: 8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Hint tooltip (one-time) */}
          <AnimatePresence>
            {showHint && !dragEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className={[
                  "mb-2",
                  sideRight ? "ml-auto" : "",
                  "w-max max-w-55",
                  "rounded-xl",
                  "bg-black/70 text-white",
                  "px-3 py-2",
                  "text-[11px] leading-snug",
                  "shadow-lg",
                  "backdrop-blur",
                ].join(" ")}
                role="status"
                aria-live="polite"
              >
                {labels.hint}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={dockRef}
            // ✅ iOS-friendly long-press drag
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.06}
            dragConstraints={constraints ?? undefined}
            style={{
              x: mvX,
              y: mvY,
              // Safari tends to respect inline touchAction more consistently
              touchAction: dragEnabled ? "none" : "auto",
            }}
            onDragStart={() => {
              movedRef.current = true;
              setExpanded(false);
              setShowHint(false);
              if (hintTimerRef.current) {
                window.clearTimeout(hintTimerRef.current);
                hintTimerRef.current = null;
              }
            }}
            onDragEnd={(_, info) => {
              const vw = window.innerWidth;

              // snap side by drop position (native-feel)
              const nextSide: DockPos["side"] =
                info.point.x < vw / 2 ? "left" : "right";

              const nextY = mvY.get();
              const next: DockPos = { side: nextSide, y: nextY };

              setPos(next);
              sessionStorage.setItem(
                "olivea_mobile_dock_pos_v5",
                JSON.stringify(next)
              );

              // snap cleanly into anchored side and exit drag mode
              mvX.set(0);
              setDragEnabled(false);
            }}
            className={[
              dragEnabled ? "touch-none" : "touch-auto",
              "select-none",
              "rounded-2xl overflow-hidden",
              "bg-white/55 backdrop-blur-xl",
              "ring-1 ring-black/10",
              "shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
              dragEnabled ? "scale-[1.02]" : "",
              "transition-transform",
            ].join(" ")}
            aria-label="Quick actions"
            onPointerDown={(e) => {
              // Desktop: drag immediately (better for devtools testing)
              if (e.pointerType === "mouse") {
                setDragEnabled(true);
                setExpanded(false);
                setShowHint(false);
                dragControls.start(e);
                return;
              }

              // Touch/Pen: long-press, then programmatically start drag
              pressedRef.current = true;
              movedRef.current = false;
              startPtRef.current = { x: e.clientX, y: e.clientY };

              clearPressTimer();
              pressTimerRef.current = window.setTimeout(() => {
                if (!pressedRef.current) return;

                setDragEnabled(true);
                setExpanded(false);
                setShowHint(false);
                dragControls.start(e);
                navigator?.vibrate?.(10);
              }, 180);
            }}
            onPointerMove={(e) => {
              if (e.pointerType === "mouse") return;

              const s = startPtRef.current;
              if (!s || !pressedRef.current) return;

              const dx = e.clientX - s.x;
              const dy = e.clientY - s.y;

              // cancel long-press if user starts moving too early
              if (!dragEnabled && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                clearPressTimer();
              }
            }}
            onPointerUp={() => endPress()}
            onPointerCancel={() => endPress()}
            onPointerLeave={() => endPress()}
          >
            {/* Handle (tap = expand) */}
            <button
              type="button"
              onClick={() => {
                // If we’re in drag mode (mouse or touch), ignore click
                if (dragEnabled) return;
                setExpanded((v) => !v);
              }}
              className={[
                "w-full flex items-center justify-between gap-3",
                "px-3 py-2",
                "text-(--olivea-olive)",
              ].join(" ")}
              aria-expanded={expanded}
            >
              <span className="flex items-center gap-2">
                {/* subtle grip hint */}
                <span
                  aria-hidden="true"
                  className="text-[12px] leading-none opacity-40 tracking-[2px]"
                >
                  ⋮⋮
                </span>
                <span className="text-xs font-medium tracking-wide">
                  {labels.actions}
                </span>
              </span>

              <span className="opacity-80">
                {expanded ? (
                  sideRight ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )
                ) : sideRight ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            </button>

            {/* Expanded actions */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t border-black/10"
                >
                  <div className="p-2 flex flex-col gap-2">
                    {/* Reserve */}
                    <button
                      id="reserve-toggle"
                      type="button"
                      onClick={() => {
                        track("Reservation Opened", {
                          source: "mobile_floating_dock",
                          section: reserveTab,        // hotel | cafe | restaurant
                          lang,
                        });
                      
                        setExpanded(false);
                        openReservationModal(reserveTab);
                      }}

                      className={[
                        "w-full flex items-center gap-2",
                        "rounded-xl",
                        "bg-(--olivea-olive) text-white",
                        "ring-1 ring-white/15",
                        "shadow-sm",
                        "px-3 py-2",
                        "active:scale-[0.99] transition-transform",
                      ].join(" ")}
                      aria-label={labels.reserve}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {labels.reserve}
                      </span>
                    </button>

                    {/* Chat */}
                    <button
                      id="mobile-chat-button"
                      type="button"
                      onClick={() => {
                        track("Chat Opened", {
                          source: "mobile_floating_dock",
                          available: chatAvailable,
                          lang,
                        });
                        setExpanded(false);
                        sessionStorage.setItem("olivea_chat_intent", "1");
                        document.body.classList.add("olivea-chat-open");
                        const toggleBtn =
                          document.getElementById("chatbot-toggle");
                        toggleBtn?.click();
                        document.body.classList.add("olivea-chat-open");
                      }}
                      className={[
                        "relative w-full flex items-center gap-2",
                        "rounded-xl",
                        "bg-(--olivea-shell) text-(--olivea-olive)",
                        "ring-1 ring-black/10",
                        "shadow-sm",
                        "px-3 py-2",
                        "active:scale-[0.99] transition-transform",
                      ].join(" ")}
                      aria-label={labels.chat}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">{labels.chat}</span>

                      {/* Availability dot */}
                      <span
                        aria-hidden="true"
                        className={[
                          "absolute right-2 top-1/2 -translate-y-1/2",
                          "block h-2.5 w-2.5 rounded-full border border-white",
                          chatAvailable
                            ? "bg-green-500 animate-pulse"
                            : "bg-red-500",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
