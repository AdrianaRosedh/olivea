// components/navigation/MobileNav.tsx
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePathname } from "next/navigation";
import { useChatSlots, useUiText } from "@/lib/uiText/context";
import { chatOpensAt, isChatOpen } from "@/lib/chatHours";
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
import { Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { reserveDefault } from "@/lib/sections";

type Props = { isDrawerOpen?: boolean };
type DockSide = "left" | "right";
type DockPos = { side: DockSide; y: number };

const SPRING = { stiffness: 560, damping: 48, mass: 0.8 } as const;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ───────────────── Slimmer geometry ───────────────── */
const ROW = 36;
const GAP = 8;
const PAD = 7;
const TEXT_PAD_X = 10;
const PILL_GAP = 8;

// Reserve speaks like the desktop Reservar button: serif capitals, spaced.
const RESERVE_TEXT = "text-[12.5px] font-semibold uppercase tracking-[0.2em] font-(family-name:--font-serif)";
const CHAT_TEXT = "text-[14px] font-medium tracking-[0.02em]";

// The chat status dot and its gap, beside the label.
const DOT_W = 16;

const MAX_AWAY_COLLAPSED = 28;
const MAX_AWAY_EXPANDED = 40;

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

function getViewportH(): number {
  if (typeof window === "undefined") return 800;
  return window.visualViewport?.height ?? window.innerHeight;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function approxDockH(): number {
  // Handle, Reserve, Chat. The open/close toggle and the drag grip used to be
  // two separate rows; one handle now does both.
  const rows = 3 * ROW;
  const gaps = 2 * GAP;
  const pad = 2 * PAD;
  return rows + gaps + pad + 8;
}

function clampDockY(y: number): number {
  if (typeof window === "undefined") return y;
  const padTop = 12 + getHeaderH();
  const padBottom = 12 + getMobileNavH();
  const h = approxDockH();
  const vh = getViewportH();
  const minY = -(vh - h - padBottom);
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

  // Wording and hours from /admin (Interface text; Operating Hours → Chat).
  const t = useUiText(lang);
  const chatSlots = useChatSlots();
  const labels = useMemo(
    () => ({
      reserve: t("chat.reserve"),
      live: t("chat.live"),
      chat: t("chat.chat"),
      chatOn: t("chat.online"),
      chatOff: t("chat.opensAt").replace("{time}", chatOpensAt(chatSlots)),
      open: t("chat.dockOpen"),
      close: t("chat.dockClose"),
    }),
    [t, chatSlots]
  );

  // Undefined on a page that belongs to no house: the guest chooses.
  const reserveSection = pathname ? reserveDefault(pathname) : null;
  const reserveTab: ReservationType | undefined = reserveSection
    ? ({ casa: "hotel", farmtotable: "restaurant", cafe: "cafe" } as const)[reserveSection]
    : undefined;

  const isContentHeavy =
    !!pathname &&
    (pathname.includes("/journal") ||
      pathname.includes("/diario") ||
      pathname.includes("/posts"));

  const chatLabel = `${labels.chat} · ${chatAvailable ? labels.chatOn : labels.chatOff}`;

  const [wReserve, setWReserve] = useState(64);
  const [wChat, setWChat] = useState(34);

  const pillWReserve = ROW + PILL_GAP + wReserve + TEXT_PAD_X * 2;
  const pillWChat = ROW + PILL_GAP + DOT_W + wChat + TEXT_PAD_X * 2;

  const compactW = ROW + PAD * 2;
  const expandedW = Math.max(pillWReserve, pillWChat, ROW) + PAD * 2;

  const sideRight = pos.side === "right";

  // ✅ reduce expensive blur on coarse pointers (Android)
  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia?.("(pointer: coarse)");
    if (!mql) return;

    const apply = () => setCoarsePointer(!!mql.matches);
    apply();

    // Safari uses addListener/removeListener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyMql: any = mql;
    if (anyMql.addEventListener) anyMql.addEventListener("change", apply);
    else anyMql.addListener?.(apply);

    return () => {
      if (anyMql.removeEventListener) anyMql.removeEventListener("change", apply);
      else anyMql.removeListener?.(apply);
    };
  }, []);

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

  useEffect(() => {
    const updateChat = () => setChatAvailable(isChatOpen(chatSlots));
    updateChat();
    const id = window.setInterval(updateChat, 60_000);
    return () => window.clearInterval(id);
  }, [chatSlots]);

  // Set when a drag starts, so the click that ends it doesn't toggle the
  // labels; cleared just after that click.
  const draggedRef = useRef(false);
  // Where a press on the handle began, to tell a tap from a drag.
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  // The dock's offset from its new edge at the moment it is dropped, so it
  // glides from where the finger left it instead of jumping.
  const snapFromRef = useRef<number | null>(null);

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

  useEffect(() => {
    setExpanded(false);
    setIsDragging(false);
    mvX.set(0);
    mvY.set(pos.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

    const vh = getViewportH();
    const top = -(vh - h - padBottom);
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
    recomputeConstraints();
    window.addEventListener("resize", recomputeConstraints);
    window.addEventListener("orientationchange", recomputeConstraints);
    window.visualViewport?.addEventListener("resize", recomputeConstraints);
    window.visualViewport?.addEventListener("scroll", recomputeConstraints);
    return () => {
      window.removeEventListener("resize", recomputeConstraints);
      window.removeEventListener("orientationchange", recomputeConstraints);
      window.visualViewport?.removeEventListener("resize", recomputeConstraints);
      window.visualViewport?.removeEventListener("scroll", recomputeConstraints);
    };
  }, [recomputeConstraints]);

  const onReserve = useCallback(() => {
    track("Reservation Opened", {
      source: expanded
        ? "mobile_floating_dock_expanded"
        : "mobile_floating_dock",
      section: reserveTab ?? "choose",
      lang,
    });
    setExpanded(false);
    openReservationModal(reserveTab);
  }, [expanded, lang, openReservationModal, reserveTab]);

  useEffect(() => {
    const handler = () => {
      if (isDrawerOpen || outlineOpen) return;
      if (isDragging) return;
      onReserve();
    };

    const prewarm = () => {};

    window.addEventListener("olivea:reserve", handler as EventListener);
    window.addEventListener("olivea:reserve-intent", prewarm as EventListener);

    return () => {
      window.removeEventListener("olivea:reserve", handler as EventListener);
      window.removeEventListener(
        "olivea:reserve-intent",
        prewarm as EventListener
      );
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
  }, [chatAvailable, expanded, lang]);

  const onDragStart = useCallback(() => {
    draggedRef.current = true;
    setExpanded(false);
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const vw = window.innerWidth;
      const nextSide: DockSide = info.point.x < vw / 2 ? "left" : "right";

      // The drag moves the springs (sx, sy) directly; mvX/mvY never saw it.
      // Reading them saved the old spot and left the dock where it was
      // dropped, partly off the screen after switching sides.
      const clampedY = clampDockY(sy.get());
      mvY.jump(clampedY);
      sy.jump(clampedY);

      const r = dockRef.current?.getBoundingClientRect();
      snapFromRef.current = r
        ? nextSide === "left"
          ? r.left - 12
          : r.right - (vw - 12)
        : 0;

      const next: DockPos = { side: nextSide, y: clampedY };
      setPos(next);
      sessionStorage.setItem("olivea_mobile_dock_pos_v17", JSON.stringify(next));

      setIsDragging(false);
      // A touch drag ends without a click; don't let the flag swallow the next tap.
      window.setTimeout(() => {
        draggedRef.current = false;
      }, 0);
    },
    [mvY, sy]
  );

  // Once the dock is anchored to its new edge, start from where it was
  // dropped and glide in.
  useLayoutEffect(() => {
    const from = snapFromRef.current;
    if (from == null) return;
    snapFromRef.current = null;
    mvX.jump(from);
    sx.jump(from);
    animate(mvX, 0, { type: "spring", ...SPRING });
  }, [pos, mvX, sx]);

  const toggleExpanded = useCallback(() => {
    setExpanded((v) => !v);
    requestAnimationFrame(() => recomputeConstraints());
  }, [recomputeConstraints]);

  const handleStyle = { touchAction: "none" } satisfies CSSProperties;

  if (isDrawerOpen || outlineOpen) return null;

  function ActionRow({
    tone,
    label,
    pillW,
    onClick,
    showDot,
  }: {
    tone: "reserve" | "live" | "chat";
    label: string;
    pillW: number;
    onClick: () => void;
    showDot?: boolean;
  }) {
    const isReserve = tone === "reserve";
    const isLive = tone === "live";

    // Reserve wears the desktop Reservar button's signature shape: soft
    // corners on the left, a full round end on the right.
    const radius = isReserve ? "rounded-l-[11px] rounded-r-[18px]" : "rounded-[18px]";

    const boxBg = isReserve
      ? "bg-(--olivea-olive) ring-1 ring-black/5 shadow-[0_6px_14px_-8px_rgba(40,60,35,0.7)]"
      : "bg-white/60 ring-1 ring-(--olivea-olive)/12";

    const fg = isReserve ? "text-(--olivea-cream)" : "text-(--olivea-olive)";

    const icon = isReserve ? (
      <Calendar className="h-4 w-4" />
    ) : isLive ? (
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span
          className="absolute h-2.5 w-2.5 rounded-full bg-green-400"
          style={{ animation: "live-pulse 2s ease-out infinite" }}
        />
        <span className="relative h-2.5 w-2.5 rounded-full bg-green-400" />
      </span>
    ) : (
      <MessageSquare className="h-4 w-4" />
    );

    // Calm status: olive when someone is answering, a quiet grey outside
    // hours. Red read as an error.
    const dotTone = chatAvailable
      ? "bg-(--olivea-olive) ring-2 ring-(--olivea-olive)/20"
      : "bg-(--olivea-olive)/30";

    return (
      <motion.button
        type="button"
        onClick={onClick}
        // The visible word only shows when the bar is expanded; collapsed it is
        // an icon, which a screen reader announced as just "button".
        aria-label={label}
        className={cn(
          "relative isolate",
          radius,
          "inline-flex items-center",
          expanded
            ? sideRight
              ? "justify-end"
              : "justify-start"
            : "justify-start",
          "active:scale-[0.97] transition-transform",
          "h-9"
        )}
        style={{ width: expanded ? pillW : ROW }}
        animate={{ width: expanded ? pillW : ROW }}
        transition={{ type: "spring", ...SPRING }}
      >
        <motion.span
          className={cn("absolute inset-0", radius, boxBg)}
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
              {showDot ? (
                <span
                  aria-hidden="true"
                  className={cn("mr-2 block h-2 w-2 rounded-full", dotTone)}
                />
              ) : null}
              <span className={cn("whitespace-nowrap", isReserve ? RESERVE_TEXT : CHAT_TEXT)}>{label}</span>
            </motion.span>
          )}
        </AnimatePresence>

        {!expanded && showDot ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute right-1.5 top-1.5 z-10",
              "block h-2 w-2 rounded-full border border-white/80",
              dotTone
            )}
          />
        ) : null}
      </motion.button>
    );
  }

  return (
    // Always on screen (owner, 2026-10-25): Reserve and Chat used to appear
    // only after scrolling past the top and, briefly, tucked away while
    // reading. Guests lost them. It steps aside only for the menu and the
    // chapter outline (above).
    <AnimatePresence>
        <>
          {/* Pulse animation for live dot */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes live-pulse {
              0% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(2.2); opacity: 0; }
              100% { transform: scale(1); opacity: 0; }
            }
          ` }} />

          <MeasureText
            text={labels.reserve}
            className={RESERVE_TEXT}
            onWidth={setWReserve}
          />
          <MeasureText
            text={chatLabel}
            className={CHAT_TEXT}
            onWidth={setWChat}
          />

          <motion.div
            className={cn(
              "fixed md:hidden z-200 pointer-events-none",
              sideRight ? "right-3" : "left-3",
              // Sits on the chapter bar's measured height (it grows a title
              // row at the end of a page) and rises above the promo banner
              // while it shows (SiteBanner sets --olivea-banner-clear).
              "bottom-[calc(var(--mobile-dock-h,calc(env(safe-area-inset-bottom,0px)+84px))+10px+var(--olivea-banner-clear,0px))]",
              "transition-[bottom] duration-200 ease-out",
              isContentHeavy ? "opacity-95" : ""
            )}
            initial={{ opacity: 0, x: sideRight ? 18 : -18, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: sideRight ? 18 : -18, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <motion.div
              className={cn(
                "relative pointer-events-auto select-none",
                "rounded-[22px] overflow-hidden",
                // The house glass: the cream of the promo bar and the press
                // band, a hairline olive edge and a soft olive shadow.
                coarsePointer
                  ? "bg-(--olivea-cream)/92 backdrop-blur-md"
                  : "bg-(--olivea-cream)/80 backdrop-blur-xl",
                "ring-1 ring-(--olivea-olive)/14",
                "shadow-[0_18px_40px_-22px_rgba(40,60,35,0.5)]"
              )}
              ref={dockRef}
              drag
              dragControls={dragControls}
              dragListener={false}
              dragDirectionLock
              dragMomentum={false}
              dragPropagation={false}
              dragElastic={0.06}
              dragConstraints={dragConstraints}
              style={{ x: sx, y: sy, touchAction: "pan-y" }}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onPointerCancel={() => setIsDragging(false)}
              aria-label={lang === "es" ? "Acciones rápidas" : "Quick actions"}
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
                  {/* One handle: tap shows the labels, drag moves the dock
                      (it was two rows, a "<" toggle and a separate grip). */}
                  <button
                    type="button"
                    aria-label={expanded ? labels.close : labels.open}
                    aria-expanded={expanded}
                    style={handleStyle}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      pressRef.current = { x: e.clientX, y: e.clientY };
                      dragControls.start(e);
                    }}
                    // A tap is read from the press itself: with the drag
                    // wired to this handle, a touch never produces a click.
                    onPointerUp={(e) => {
                      const from = pressRef.current;
                      pressRef.current = null;
                      if (!from || draggedRef.current) return;
                      if (Math.hypot(e.clientX - from.x, e.clientY - from.y) > 8) return;
                      toggleExpanded();
                    }}
                    // Keyboard (Enter / Space) still arrives as a click.
                    onClick={(e) => {
                      if (e.detail === 0) toggleExpanded();
                    }}
                    className={cn(
                      "w-9 h-9 rounded-[18px] cursor-grab active:cursor-grabbing",
                      "inline-flex items-center justify-center",
                      "active:bg-(--olivea-olive)/8 transition-colors"
                    )}
                  >
                    <span className="grid grid-cols-3 gap-0.75" aria-hidden="true">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-0.75 w-0.75 rounded-full bg-(--olivea-olive)/50"
                        />
                      ))}
                    </span>
                  </button>

                  <ActionRow
                    tone="reserve"
                    label={labels.reserve}
                    pillW={pillWReserve}
                    onClick={onReserve}
                  />

                  <ActionRow
                    tone="chat"
                    label={chatLabel}
                    pillW={pillWChat}
                    onClick={onChat}
                    showDot
                  />
                </div>
              </motion.div>

            </motion.div>
          </motion.div>
        </>
    </AnimatePresence>
  );
}