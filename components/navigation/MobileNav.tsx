// components/navigation/MobileNav.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";
import { useReservation } from "@/contexts/ReservationContext";
import type { ReservationType } from "@/contexts/ReservationContext";
import { track } from "@vercel/analytics";
import {
  motion,
  AnimatePresence,
  useDragControls,
  useMotionValue,
  useSpring,
  animate,
  type PanInfo,
} from "framer-motion";
import { Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { isDrawerOpen?: boolean };
type DockSide = "left" | "right";
type DockPos = { side: DockSide; y: number };

const SPRING = { stiffness: 560, damping: 48, mass: 0.8 } as const;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ───────────────── Slimmer geometry ───────────────── */
const ROW = 36; // slimmer
const GAP = 8;
const PAD = 7;
const TEXT_PAD_X = 10;
const PILL_GAP = 8;

/* “give” away from edge so it feels draggable but never vanishes */
const MAX_AWAY_COLLAPSED = 28;
const MAX_AWAY_EXPANDED = 40;

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

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Dock height is basically constant (expanding only changes WIDTH),
 * so keep this param-less to avoid TS “declared but never read”.
 */
function approxDockH(): number {
  // handle + 2 actions + toggle, plus padding/gaps
  const rows = 4 * ROW;
  const gaps = 3 * GAP;
  const pad = 2 * PAD;
  return rows + gaps + pad + 8;
}

function clampDockY(y: number): number {
  if (typeof window === "undefined") return y;
  const padTop = 12 + getHeaderH();
  const padBottom = 12 + getMobileNavH();
  const h = approxDockH();
  const minY = -(window.innerHeight - h - padBottom);
  const maxY = padTop;
  return clamp(y, minY, maxY);
}

function clampDockX(x: number, side: DockSide, expanded: boolean): number {
  if (typeof window === "undefined") return x;
  const maxAway = expanded ? MAX_AWAY_EXPANDED : MAX_AWAY_COLLAPSED;
  if (side === "right") return clamp(x, -maxAway, 0);
  return clamp(x, 0, maxAway);
}

function MeasureText({
  text,
  className,
  onWidth,
}: {
  text: string;
  className: string;
  onWidth: (w: number) => void;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const w = Math.ceil(el.getBoundingClientRect().width);
      if (w > 0) onWidth(w);
    };

    measure();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fonts: any = (document as any).fonts;
    if (fonts?.ready) fonts.ready.then(measure).catch(() => {});

    return () => {};
  }, [text, onWidth]);

  return (
    <span
      ref={ref}
      className={cn(
        "absolute opacity-0 pointer-events-none select-none",
        className
      )}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

export function MobileNav({ isDrawerOpen }: Props) {
  const { openReservationModal } = useReservation();
  const pathname = usePathname();

  const [chatAvailable, setChatAvailable] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [pos, setPos] = useState<DockPos>(() => ({ side: "right", y: 0 }));

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);

  const sx = useSpring(mvX, SPRING);
  const sy = useSpring(mvY, SPRING);

  const dragControls = useDragControls();

  const lang = useMemo<"es" | "en">(() => {
    if (!pathname) return "es";
    return pathname.startsWith("/en") ? "en" : "es";
  }, [pathname]);

  const labels = useMemo(() => {
    return lang === "es"
      ? {
          reserve: "Reservar",
          chat: "Chat",
          move: "Mover",
          open: "Abrir",
          close: "Cerrar",
        }
      : {
          reserve: "Reserve",
          chat: "Chat",
          move: "Move",
          open: "Open",
          close: "Close",
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

  /* measured label widths */
  const [wReserve, setWReserve] = useState(64);
  const [wChat, setWChat] = useState(34);

  const pillWReserve = ROW + PILL_GAP + wReserve + TEXT_PAD_X * 2;
  const pillWChat = ROW + PILL_GAP + wChat + TEXT_PAD_X * 2;

  const compactW = ROW + PAD * 2;
  const expandedW = Math.max(pillWReserve, pillWChat, ROW) + PAD * 2;

  const sideRight = pos.side === "right";

  // ✅ Hide action dock while MobileSectionNav outline is open
  const [outlineOpen, setOutlineOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOutlineOpen(true);
    const onClose = () => setOutlineOpen(false);

    window.addEventListener("olivea:mobile-outline-open", onOpen);
    window.addEventListener("olivea:mobile-outline-close", onClose);

    return () => {
      window.removeEventListener("olivea:mobile-outline-open", onOpen);
      window.removeEventListener("olivea:mobile-outline-close", onClose);
    };
  }, []);

  /* ───────────────── chat availability ───────────────── */
  useEffect(() => {
    const updateChat = () => {
      const minutes = getTijuanaMinutesNow();
      setChatAvailable(minutes >= 8 * 60 && minutes <= 21 * 60 + 30);
    };
    updateChat();
    const id = window.setInterval(updateChat, 60_000);
    return () => window.clearInterval(id);
  }, []);

  /* ───────────────── restore pos ───────────────── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("olivea_mobile_dock_pos_v17");
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

  /* ───────────────── reset on route change ───────────────── */
  useEffect(() => {
    setVisible(false);
    setExpanded(false);
    mvX.set(0);
    mvY.set(pos.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* ───────────────── visibility based on scroll ───────────────── */
  useEffect(() => {
    const threshold = isContentHeavy ? 140 : 110;
    const onScroll = () => {
      if (isDragging) return;
      setVisible((window.scrollY || 0) > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isContentHeavy, isDragging]);

  /* ───────────────── constraints (prevents “disappearing”) ───────────────── */
  const [dragConstraints, setDragConstraints] = useState({
    top: -500,
    bottom: 100,
    left: -MAX_AWAY_COLLAPSED,
    right: 0,
  });

  const recomputeConstraints = useCallback(() => {
    if (typeof window === "undefined") return;

    const padTop = 12 + getHeaderH();
    const padBottom = 12 + getMobileNavH();
    const h = approxDockH();

    const top = -(window.innerHeight - h - padBottom);
    const bottom = padTop;

    const maxAway = expanded ? MAX_AWAY_EXPANDED : MAX_AWAY_COLLAPSED;
    const left = pos.side === "right" ? -maxAway : 0;
    const right = pos.side === "right" ? 0 : maxAway;

    setDragConstraints({ top, bottom, left, right });

    mvY.set(clampDockY(mvY.get()));
    mvX.set(clampDockX(mvX.get(), pos.side, expanded));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, pos.side]);

  useEffect(() => {
    if (!visible) return;
    recomputeConstraints();
    window.addEventListener("resize", recomputeConstraints);
    window.addEventListener("orientationchange", recomputeConstraints);
    return () => {
      window.removeEventListener("resize", recomputeConstraints);
      window.removeEventListener("orientationchange", recomputeConstraints);
    };
  }, [visible, recomputeConstraints]);

  const onReserve = useCallback(() => {
    track("Reservation Opened", {
      source: expanded
        ? "mobile_floating_dock_expanded"
        : "mobile_floating_dock",
      section: reserveTab,
      lang,
    });
    setExpanded(false);
    openReservationModal(reserveTab);
  }, [expanded, lang, openReservationModal, reserveTab]);

  // ✅ NEW: allow ANY component (hero, cards, etc) to open reservations on mobile
  useEffect(() => {
    const handler = () => {
      // if dock is intentionally not present, ignore
      if (isDrawerOpen || outlineOpen) return;

      // show the dock (so it feels intentional) then open
      setVisible(true);

      // avoid opening mid-drag
      if (isDragging) return;

      onReserve();
    };

    const prewarm = () => {
      // if you later add "warm mount" logic, this is where it goes.
      // (keeping for parity with desktop + hover intent)
    };

    window.addEventListener("olivea:reserve", handler as EventListener);
    window.addEventListener("olivea:reserve-intent", prewarm as EventListener);

    return () => {
      window.removeEventListener("olivea:reserve", handler as EventListener);
      window.removeEventListener("olivea:reserve-intent", prewarm as EventListener);
    };
  }, [isDrawerOpen, outlineOpen, isDragging, onReserve]);

  const onChat = useCallback(() => {
    track("Chat Opened", {
      source: expanded
        ? "mobile_floating_dock_expanded"
        : "mobile_floating_dock",
      available: chatAvailable,
      lang,
    });
    setExpanded(false);
    sessionStorage.setItem("olivea_chat_intent", "1");
    document.body.classList.add("olivea-chat-open");
    document.getElementById("chatbot-toggle")?.click();
    document.body.classList.add("olivea-chat-open");
  }, [chatAvailable, expanded, lang]);

  const onDragStart = useCallback(() => {
    setExpanded(false);
    setIsDragging(true);
    setVisible(true);
  }, []);

  const onDragEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const vw = window.innerWidth;
      const nextSide: DockSide = info.point.x < vw / 2 ? "left" : "right";

      const clampedY = clampDockY(mvY.get());
      mvY.set(clampedY);

      const clampedX = clampDockX(mvX.get(), nextSide, false);
      mvX.set(clampedX);

      const next: DockPos = { side: nextSide, y: clampedY };
      setPos(next);
      sessionStorage.setItem("olivea_mobile_dock_pos_v17", JSON.stringify(next));

      animate(mvX, 0, { type: "spring", ...SPRING });

      setIsDragging(false);
    },
    [mvX, mvY]
  );

  const handleStyle = { touchAction: "none" } satisfies CSSProperties;

  if (isDrawerOpen || outlineOpen) return null;

  function ActionRow({
    tone,
    label,
    pillW,
    onClick,
    showDot,
  }: {
    tone: "reserve" | "chat";
    label: string;
    pillW: number;
    onClick: () => void;
    showDot?: boolean;
  }) {
    const isReserve = tone === "reserve";

    const boxBg = isReserve
      ? "bg-(--olivea-olive) ring-1 ring-black/5"
      : "bg-white/10 ring-1 ring-white/12";

    const fg = isReserve ? "text-white" : "text-(--olivea-olive)";

    const icon = isReserve ? (
      <Calendar className="h-4 w-4" />
    ) : (
      <MessageSquare className="h-4 w-4" />
    );

    return (
      <motion.button
        type="button"
        onClick={onClick}
        className={cn(
          "relative isolate rounded-[18px]",
          "inline-flex items-center",
          expanded
            ? sideRight
              ? "justify-end"
              : "justify-start"
            : "justify-start",
          "active:scale-[0.99] transition-transform",
          "h-9"
        )}
        style={{ width: expanded ? pillW : ROW }}
        animate={{ width: expanded ? pillW : ROW }}
        transition={{ type: "spring", ...SPRING }}
      >
        <motion.span
          className={cn("absolute inset-0 rounded-[18px]", boxBg)}
          layout
          transition={{ type: "spring", ...SPRING }}
        />

        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center",
            fg
          )}
          style={{ width: ROW, height: ROW }}
        >
          {icon}
        </span>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              className={cn("relative z-10 inline-flex items-center", fg)}
              initial={{ opacity: 0, x: sideRight ? 6 : -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: sideRight ? 6 : -6 }}
              transition={{ duration: 0.16, ease: EASE }}
              style={{
                paddingLeft: sideRight ? TEXT_PAD_X : PILL_GAP,
                paddingRight: sideRight ? PILL_GAP : TEXT_PAD_X,
              }}
            >
              <span className="text-[14px] font-medium tracking-[0.02em]">
                {label}
              </span>

              {showDot ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "ml-3 block h-2.5 w-2.5 rounded-full border border-white/70",
                    chatAvailable ? "bg-green-500" : "bg-red-500"
                  )}
                />
              ) : null}
            </motion.span>
          )}
        </AnimatePresence>

        {!expanded && showDot ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-2 top-2 z-10",
              "block h-2 w-2 rounded-full border border-white/70",
              chatAvailable ? "bg-green-500" : "bg-red-500"
            )}
          />
        ) : null}
      </motion.button>
    );
  }

  const ToggleIcon = sideRight
    ? expanded
      ? ChevronRight
      : ChevronLeft
    : expanded
    ? ChevronLeft
    : ChevronRight;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <MeasureText
            text={labels.reserve}
            className="text-[14px] font-medium tracking-[0.02em]"
            onWidth={setWReserve}
          />
          <MeasureText
            text={labels.chat}
            className="text-[14px] font-medium tracking-[0.02em]"
            onWidth={setWChat}
          />

          <motion.div
            className={cn(
              "fixed md:hidden z-200 pointer-events-none",
              sideRight ? "right-3" : "left-3",
              "bottom-[calc(env(safe-area-inset-bottom,0px)+var(--mobile-nav-h,84px)+10px)]",
              isContentHeavy ? "opacity-95" : ""
            )}
            initial={{ opacity: 0, x: sideRight ? 18 : -18, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: sideRight ? 18 : -18, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <motion.div
              className={cn(
                "pointer-events-auto select-none",
                "rounded-[20px] overflow-hidden",
                "bg-white/8 backdrop-blur-xl",
                "ring-1 ring-white/14",
                "shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              )}
              drag
              dragControls={dragControls}
              dragListener={false}
              dragMomentum={false}
              dragElastic={0.06}
              dragConstraints={dragConstraints}
              style={{ x: sx, y: sy, touchAction: "none" }}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              aria-label="Quick actions"
            >
              <motion.div
                className="p-1.75"
                style={{ originX: sideRight ? 1 : 0 }}
                animate={{ width: expanded ? expandedW : compactW, x: 0 }}
                transition={{ type: "spring", ...SPRING }}
              >
                <div
                  className={cn(
                    "flex flex-col",
                    expanded
                      ? sideRight
                        ? "items-end"
                        : "items-start"
                      : "items-center"
                  )}
                  style={{ gap: GAP }}
                >
                  {/* TOP = Toggle (open/close) */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpanded((v) => !v);
                      requestAnimationFrame(() => recomputeConstraints());
                    }}
                    aria-label={expanded ? labels.close : labels.open}
                    className={cn(
                      "w-9 h-9 rounded-[18px]",
                      "inline-flex items-center justify-center",
                      "bg-white/10",
                      "ring-1 ring-white/12",
                      "active:scale-[0.98] transition-transform"
                    )}
                  >
                    <ToggleIcon className="h-4 w-4 text-(--olivea-olive) opacity-70" />
                  </button>

                  <ActionRow
                    tone="reserve"
                    label={labels.reserve}
                    pillW={pillWReserve}
                    onClick={onReserve}
                  />

                  <ActionRow
                    tone="chat"
                    label={labels.chat}
                    pillW={pillWChat}
                    onClick={onChat}
                    showDot
                  />

                  {/* BOTTOM = Drag handle */}
                  <button
                    type="button"
                    aria-label={labels.move}
                    style={handleStyle}
                    onPointerDown={(e) => dragControls.start(e)}
                    className={cn(
                      "w-9 h-9 rounded-[18px]",
                      "inline-flex items-center justify-center",
                      "active:bg-white/10 transition-colors"
                    )}
                  >
                    <span className="grid grid-cols-3 gap-0.75" aria-hidden="true">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-0.75 w-0.75 rounded-full bg-(--olivea-olive)/40"
                        />
                      ))}
                    </span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
