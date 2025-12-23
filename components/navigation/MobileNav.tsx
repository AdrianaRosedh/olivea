// components/navigation/MobileNav.tsx
"use client";

import {
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { ReservationType } from "@/contexts/ReservationContext";
import { useSpring, animate } from "framer-motion";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useDragControls,
} from "framer-motion";
import { track } from "@vercel/analytics";
import { cn } from "@/lib/utils";

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

function getMobileNavH(): number {
  if (typeof window === "undefined") return 84;
  const v = getComputedStyle(document.documentElement).getPropertyValue(
    "--mobile-nav-h"
  );
  const n = parseInt(v || "", 10);
  return Number.isFinite(n) && n > 0 ? n : 84;
}

function getHeaderH(): number {
  if (typeof window === "undefined") return 64;
  const v = getComputedStyle(document.documentElement).getPropertyValue(
    "--header-h"
  );
  const n = parseInt(v || "", 10);
  return Number.isFinite(n) && n > 0 ? n : 64;
}

export function MobileNav({ isDrawerOpen }: Props) {
  const { openReservationModal } = useReservation();
  const pathname = usePathname();

  const [chatAvailable, setChatAvailable] = useState(false);
  const [visible, setVisible] = useState(false);

  // expands on tap
  const [expanded, setExpanded] = useState(false);

  // long-press to drag
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

  // Motion values
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);

  // Springs (magnetic snap feel)
  const sx = useSpring(mvX, { stiffness: 520, damping: 38, mass: 0.7 });
  const sy = useSpring(mvY, { stiffness: 520, damping: 38, mass: 0.7 });

  const dragControls = useDragControls();

  // Measure actual dock size to clamp constraints properly
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
      const raw = sessionStorage.getItem("olivea_mobile_dock_pos_v6");
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

    const key = "olivea_mobile_dock_hint_seen_v2";
    const seen = sessionStorage.getItem(key);
    if (seen) return;

    const t = window.setTimeout(() => {
      setShowHint(true);
      sessionStorage.setItem(key, "1");

      hintTimerRef.current = window.setTimeout(() => {
        setShowHint(false);
        hintTimerRef.current = null;
      }, 2400);
    }, 500);

    return () => window.clearTimeout(t);
  }, [visible]);

  /* ---------------- constraints (viewport-based, stable) ---------------- */
  const recalcConstraints = useCallback(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const r = dock.getBoundingClientRect();

    // Keep away from edges, top navbar, and bottom MobileSectionNav
    const padX = 10;
    const padTop = 14 + getHeaderH();
    const padBottom = 12 + getMobileNavH() + (expanded ? 8 : 0);

    const left = -r.left + padX;
    const right = window.innerWidth - (r.left + r.width) - padX;

    const top = -r.top + padTop;
    const bottom = window.innerHeight - (r.top + r.height) - padBottom;

    setConstraints({ left, right, top, bottom });
  }, [expanded]);

  useEffect(() => {
    if (!visible) return;
    const raf = requestAnimationFrame(recalcConstraints);

    window.addEventListener("resize", recalcConstraints);
    window.addEventListener("orientationchange", recalcConstraints);

    // recalc after layout settles
    const t1 = window.setTimeout(recalcConstraints, 120);
    const t2 = window.setTimeout(recalcConstraints, 520);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalcConstraints);
      window.removeEventListener("orientationchange", recalcConstraints);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [visible, expanded, recalcConstraints]);

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

    if (!movedRef.current) setDragEnabled(false);
    movedRef.current = false;
  };

  if (isDrawerOpen) return null;

  const sideRight = pos.side === "right";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={[
            "fixed md:hidden z-200 pointer-events-none",
            sideRight ? "right-3" : "left-3",
            // stay above MobileSectionNav
            "bottom-[calc(env(safe-area-inset-bottom,0px)+var(--mobile-nav-h,84px)+10px)]",
            isContentHeavy ? "opacity-95" : "",
          ].join(" ")}
          initial={{ opacity: 0, x: sideRight ? 40 : -40, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: sideRight ? 40 : -40, y: 8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Hint tooltip */}
          <AnimatePresence>
            {showHint && !dragEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className={[
                  "pointer-events-auto mb-2",
                  sideRight ? "ml-auto" : "",
                  "w-max max-w-60",
                  "rounded-2xl",
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
            // ✅ critical: wrapper is pointer-events-none; dock must re-enable
            className={cn(
              "pointer-events-auto select-none",
              "rounded-2xl overflow-hidden",
              "bg-(--olivea-cream)/70 backdrop-blur-md",
              "ring-1 ring-(--olivea-olive)/14",
              "shadow-[0_10px_28px_rgba(18,24,16,0.12)]",
              dragEnabled ? "scale-[1.015]" : "",
              "transition-transform"
            )}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.06}
            dragConstraints={constraints ?? undefined}
            style={{
              x: sx,
              y: sy,
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
              const nextSide: DockPos["side"] =
                info.point.x < vw / 2 ? "left" : "right";

              const nextY = mvY.get();
              const next: DockPos = { side: nextSide, y: nextY };

              setPos(next);
              sessionStorage.setItem("olivea_mobile_dock_pos_v6", JSON.stringify(next));

              // magnetic snap: x → 0 with spring (wrapper anchors edge)
              animate(mvX, 0, {
                type: "spring",
                stiffness: 520,
                damping: 38,
                mass: 0.7,
              });

              setDragEnabled(false);
            }}
            aria-label="Quick actions"
          >
            {/* HEADER ROW */}
            <div className="flex items-center gap-2 px-2.5 py-2">
              {/* Dedicated grip (drag here) */}
              <button
                type="button"
                className={cn(
                  "shrink-0 inline-flex items-center justify-center",
                  "h-9 w-9 rounded-xl",
                  "bg-transparent text-(--olivea-olive)/70 hover:text-(--olivea-olive)",
                  "ring-1 ring-(--olivea-olive)/10",
                  "active:scale-[0.99] transition-transform",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)"
                )}
                aria-label={lang === "es" ? "Mover" : "Move"}
                onPointerDown={(e) => {
                  // Mouse: enable drag immediately AND still allow normal click elsewhere
                  if (e.pointerType === "mouse") {
                    setDragEnabled(true);
                    setExpanded(false);
                    setShowHint(false);
                    dragControls.start(e);
                    return;
                  }

                  // Touch/Pen: long press
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
                  if (!dragEnabled && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                    clearPressTimer();
                  }
                }}
                onPointerUp={() => endPress()}
                onPointerCancel={() => endPress()}
                onPointerLeave={() => endPress()}
              >
                <GripVertical className="h-4 w-4 opacity-80" />
              </button>

              {/* Tap area (expand/collapse) */}
              <button
                type="button"
                onClick={() => {
                  if (dragEnabled) return;
                  setExpanded((v) => !v);
                }}
                className={cn(
                  "min-w-0 flex-1",
                  "h-9 rounded-xl",
                  "px-3",
                  "bg-(--olivea-cream)/60",
                  "text-(--olivea-olive)",
                  "ring-1 ring-(--olivea-olive)/14",
                  "inline-flex items-center justify-between gap-2",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)"
                )}
                aria-expanded={expanded}
              >
                <span className="truncate text-[11px] leading-none font-medium tracking-[0.28em] uppercase">
                  {labels.actions}
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
            </div>

            {/* Expanded actions */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t border-(--olivea-olive)/14"
                >
                  <div className="p-3 flex flex-col gap-2">
                    {/* Reserve */}
                    <button
                      id="reserve-toggle"
                      type="button"
                      onClick={() => {
                        track("Reservation Opened", {
                          source: "mobile_floating_dock",
                          section: reserveTab,
                          lang,
                        });

                        setExpanded(false);
                        openReservationModal(reserveTab);
                      }}
                      className={cn(
                        "w-full inline-flex items-center gap-2",
                        "rounded-2xl",
                        "bg-(--olivea-olive) text-white",
                        "ring-1 ring-white/15",
                        "shadow-sm",
                        "px-3 py-2",
                        "active:scale-[0.99] transition-transform"
                      )}
                      aria-label={labels.reserve}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{labels.reserve}</span>
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
                        document.getElementById("chatbot-toggle")?.click();
                        document.body.classList.add("olivea-chat-open");
                      }}
                      className={cn(
                        "relative w-full inline-flex items-center gap-2",
                        "rounded-2xl",
                        "bg-(--olivea-shell) text-(--olivea-olive)",
                        "ring-1 ring-(--olivea-olive)/14",
                        "shadow-sm",
                        "px-3 py-2",
                        "active:scale-[0.99] transition-transform"
                      )}
                      aria-label={labels.chat}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">{labels.chat}</span>

                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2",
                          "block h-2.5 w-2.5 rounded-full border border-white",
                          chatAvailable ? "bg-green-500 animate-pulse" : "bg-red-500"
                        )}
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