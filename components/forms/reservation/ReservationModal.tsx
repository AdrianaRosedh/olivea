// components/forms/reservation/ReservationModal.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  type WheelEventHandler,
} from "react";
import { X, ExternalLink, Maximize2, Minimize2, ArrowRight } from "lucide-react";
import {
  motion,
  type Variants,
  type Transition,
  AnimatePresence,
} from "framer-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  useReservation,
  type ReservationType,
} from "@/contexts/ReservationContext";
import dynamic from "next/dynamic";
// Static, not lazy: the module is already in this chunk (its helpers are
// imported here), and a lazy boundary only delayed the frame's first request.
import OpentableWidget, { openOpenTableWindow, openTableUrl } from "./OpentableWidget";
import { HOUSES, HOUSE_ORDER } from "@/lib/houses";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BusinessHours } from "@/lib/content/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Client-only widgets (already memoized)
const CloudbedsWidget = dynamic(() => import("./CloudbedsWidget"), {
  ssr: false,
});

/* ── Shared constants ────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Remembers the desktop full-screen choice across sessions. */
const FULLSCREEN_KEY = "olivea:reservation-fullscreen";

/** Desktop: the booking engines sit in the window's double olive frame, the
 *  same fine rule as the house chooser: a hairline, a narrow cream margin,
 *  then the engine with its own rounded corners. */
const ENGINE_FRAME =
  "md:mx-6 md:mb-6 md:rounded-[24px] md:border md:border-(--olivea-olive)/30 md:p-1.5 md:[&>*]:rounded-[18px] md:[&>*]:overflow-hidden";

/* ── Shared ornaments ────────────────────────────────────────────── */

/** Two fine rules and a turned square: the window's divider. */
function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-2.5 text-(--olivea-olive)/45 ${className}`}>
      <span className="h-px w-10 bg-current" />
      <span className="h-1.5 w-1.5 rotate-45 border border-current" />
      <span className="h-px w-10 bg-current" />
    </div>
  );
}

/** The signature at the foot of the window's invitations. */
function Signature({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.32em] text-(--olivea-olive)/55 ${className}`}
    >
      <span className="h-px w-8 bg-current opacity-60" />
      Valle de Guadalupe
      <span className="h-px w-8 bg-current opacity-60" />
    </div>
  );
}

/** The café's opening hours, from the site settings (admin → Horarios). */
export type CafeHours = Pick<BusinessHours, "schedule" | "slots">;

const stopWheelPropagation: WheelEventHandler<HTMLDivElement> = (e) => {
  e.stopPropagation();
};

/* ── Idle scheduler ──────────────────────────────────────────────── */

type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type RequestIdleCallback = (
  cb: (deadline: IdleDeadline) => void,
  opts?: { timeout?: number }
) => number;
type CancelIdleCallback = (handle: number) => void;

function scheduleIdle(cb: () => void, timeout = 600): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & {
    requestIdleCallback?: RequestIdleCallback;
    cancelIdleCallback?: CancelIdleCallback;
  };
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(() => cb(), { timeout });
    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
    };
  }
  const t = window.setTimeout(cb, 120);
  return () => window.clearTimeout(t);
}

/* ── Hotel Pane ──────────────────────────────────────────────────── */

function HotelPane({
  lang,
  isMobile,
  mounted,
  onOpenOverlay,
}: {
  lang: "es" | "en";
  isMobile: boolean;
  mounted: boolean;
  onOpenOverlay: () => void;
}) {
  if (!mounted) return null;

  return (
    <>
      {isMobile && (
        <div className="px-4 py-3 bg-(--olivea-cream) shrink-0">
          <span
            className={`font-jakarta font-semibold text-(--olivea-ink) tracking-[0.15em] uppercase`}
            style={{ fontSize: "clamp(0.8rem,1.8vw,1rem)" }}
            id="hotel-pane-title"
          >
            {lang === "es" ? "Casa Olivea — Reservaciones" : "Casa Olivea — Reservations"}
          </span>
        </div>
      )}

      <div className={`flex-1 min-h-0 overflow-hidden ${isMobile ? "" : ENGINE_FRAME}`}>
        {isMobile ? (
          <div className="px-4 pt-6 pb-10 flex justify-center">
            <button
              type="button"
              onClick={onOpenOverlay}
              className="w-full max-w-md rounded-2xl border border-(--olivea-olive)/30 bg-(--olivea-cream)/80 px-4 py-5 text-left shadow-sm active:scale-[0.99] transition-transform"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-(--olivea-ink) mb-2">
                {lang === "es" ? "Reservación hotel" : "Hotel reservation"}
              </p>
              <p className="text-sm font-medium text-(--olivea-ink) mb-1">
                {lang === "es" ? "Reserva tu estancia en Casa Olivea" : "Book your stay at Casa Olivea"}
              </p>
              <p className="text-xs text-(--olivea-ink) mb-3">
                {lang === "es"
                  ? "Toca para reservar en pantalla completa."
                  : "Tap to book in full screen."}
              </p>
              <span className="text-xs font-semibold underline underline-offset-4">
                {lang === "es" ? "Abrir en pantalla completa" : "Open in full screen"}
              </span>
            </button>
          </div>
        ) : (
          <div className="h-full">
            <CloudbedsWidget lang={lang} />
          </div>
        )}
      </div>
    </>
  );
}

/* ── Restaurant Pane ─────────────────────────────────────────────── */

function RestaurantPane({
  lang,
  isMobile,
  mounted,
  onOpenOverlay,
}: {
  lang: "es" | "en";
  isMobile: boolean;
  mounted: boolean;
  onOpenOverlay: () => void;
}) {
  if (!isMobile) {
    return (
      <>
        {/* The tab already names the house, so no logo bar here: just the
            always-available booking link. OpenTable's page below runs as a
            third-party frame, and some browsers (Safari) limit it, so there
            is always a direct path to reserve. */}
        <div className="flex justify-end px-6 pb-2 shrink-0">
          <a
            href={openTableUrl(lang)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openOpenTableWindow}
            className="inline-flex items-center gap-1.5 text-xs text-(--olivea-ink)/60 underline-offset-4 hover:text-(--olivea-olive) hover:underline whitespace-nowrap"
          >
            {lang === "es" ? "Reservar directamente en OpenTable" : "Reserve directly on OpenTable"}
            <ExternalLink size={13} />
          </a>
        </div>

        <div
          className={`flex-1 min-h-0 overflow-hidden ${ENGINE_FRAME}`}
          aria-label="Olivea Farm To Table"
          onWheelCapture={stopWheelPropagation}
        >
          {mounted && <OpentableWidget lang={lang} />}
        </div>
      </>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 bg-(--olivea-cream) shrink-0">
        <span
          className={`font-jakarta font-semibold text-(--olivea-ink) tracking-[0.15em] uppercase`}
          style={{ fontSize: "clamp(0.8rem,1.8vw,1rem)" }}
          id="restaurant-pane-title"
        >
          Olivea Farm To Table — OpenTable
        </span>
      </div>

      <div className="flex-1 min-h-0 px-4 pt-6 pb-10 flex justify-center">
        <button
          type="button"
          onClick={onOpenOverlay}
          className="w-full max-w-md rounded-2xl border border-(--olivea-olive)/30 bg-(--olivea-cream)/80 px-4 py-5 text-left shadow-sm active:scale-[0.99] transition-transform"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-(--olivea-ink) mb-2">
            {lang === "es" ? "Reservación restaurante" : "Restaurant reservation"}
          </p>
          <p className="text-sm font-medium text-(--olivea-ink) mb-1">
            {lang === "es" ? "Busca mesa en Olivea Farm To Table" : "Find a table at Olivea Farm To Table"}
          </p>
          <p className="text-xs text-(--olivea-ink) mb-3">
            {lang === "es"
              ? "Toca para reservar en pantalla completa."
              : "Tap to reserve in full screen."}
          </p>
          <span className="text-xs font-semibold underline underline-offset-4">
            {lang === "es" ? "Abrir en pantalla completa" : "Open in full screen"}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── Cafe Pane ───────────────────────────────────────────────────── */

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "Todos los días · 7:15 a.m. – 4:00 p.m." from the settings' slots; the
 *  schedule text when there are none. Client-only (the window never SSRs). */
function hoursLines(hours: CafeHours | null | undefined, lang: "es" | "en"): string[] {
  const locale = lang === "es" ? "es-MX" : "en-US";
  const time = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(
      new Date(2000, 0, 1, h, m)
    );
  };
  const dayName = (day: string) =>
    new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
      new Date(2024, 0, 1 + WEEK.indexOf(day)) // 2024-01-01 was a Monday
    );

  const slots = hours?.slots ?? [];
  if (!slots.length) return hours?.schedule ? [hours.schedule[lang]] : [];
  return slots.map((slot) => {
    const days =
      slot.days.length === 7
        ? lang === "es" ? "Todos los días" : "Every day"
        : slot.days.map(dayName).join(", ");
    return `${days} · ${time(slot.opens)} – ${time(slot.closes)}`;
  });
}

/**
 * The café takes no reservations, so its tab is an invitation rather than a
 * booking engine: come whenever, and these are the hours.
 */
function CafePane({ lang, cafeHours }: { lang: "es" | "en"; cafeHours?: CafeHours | null }) {
  const { closeReservationModal } = useReservation();
  const pathname = usePathname();
  const house = HOUSES.cafe;
  const lines = hoursLines(cafeHours, lang);
  const cafeHref = lang === "es" ? "/es/cafe" : "/en/cafe";
  const onCafePage = pathname === cafeHref || (lang === "es" && pathname === "/cafe");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-12 pb-8">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-6 text-center">
        {/* The invitation in the chooser's double olive frame, the emblem set
            into its top edge like a seal. */}
        <div className="relative w-full rounded-[28px] border border-(--olivea-olive)/45 px-7 pt-14 pb-8">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-1.25 rounded-[23px] border border-(--olivea-olive)/18"
          />
          <span className="absolute left-1/2 top-0 h-18 w-18 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--olivea-olive)/45 bg-(--olivea-cream) p-2.5">
            <span className="relative block h-full w-full">
              <Image src={house.emblem} alt="" fill sizes="52px" className="object-contain" />
            </span>
          </span>

          <h3
            className="relative text-(--olivea-olive)"
            style={{ fontFamily: "var(--font-serif)", fontSize: 27, fontWeight: 600, lineHeight: 1.15 }}
          >
            {house.name}
          </h3>
          <p className="relative italic text-(--olivea-olive)/70" style={{ fontFamily: "var(--font-serif)", fontSize: 15 }}>
            {house.descriptor[lang]}
          </p>

          <Ornament className="relative my-6" />

          <p className="relative text-(--olivea-ink)" style={{ fontFamily: "var(--font-serif)", fontSize: 21, lineHeight: 1.3 }}>
            {lang === "es" ? "Por ahora no necesitas reservar." : "For now, there’s no need to reserve."}
          </p>
          <p className="relative mt-1 italic text-(--olivea-ink)/70" style={{ fontFamily: "var(--font-serif)", fontSize: 17 }}>
            {lang === "es" ? "Ven cuando quieras; te esperamos." : "Come whenever you like; we’ll be waiting."}
          </p>

          {lines.length > 0 && (
            <div className="relative mt-7 rounded-[18px] border border-(--olivea-olive)/25 px-6 py-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-(--olivea-olive)">
                {lang === "es" ? "Horario" : "Hours"}
              </p>
              {lines.map((line) => (
                <p
                  key={line}
                  className="mt-1.5 text-(--olivea-ink)"
                  style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {!onCafePage && (
            <Link
              href={cafeHref}
              onClick={closeReservationModal}
              className="relative mt-7 inline-flex items-center gap-2 rounded-full border border-(--olivea-olive)/45 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-(--olivea-olive) transition-colors hover:bg-(--olivea-olive) hover:text-(--olivea-cream)"
            >
              {lang === "es" ? "Conoce el café" : "Discover the café"}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <Signature />
      </div>
    </div>
  );
}

/* ── Mobile Hotel Overlay ────────────────────────────────────────── */

/** The phone booking sheets' header: the house's emblem in its olive seal,
 *  its name in the serif and what the sheet does, as in the chooser, instead
 *  of a line of small caps. */
function SheetHeader({
  house,
  lang,
  onClose,
  children,
}: {
  house: ReservationType;
  lang: "es" | "en";
  onClose: () => void;
  /** Extra round buttons, before Close. */
  children?: React.ReactNode;
}) {
  const h = HOUSES[house];
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-(--olivea-olive)/15 bg-(--olivea-cream) px-4 py-3">
      <span className="relative h-11 w-11 shrink-0 rounded-full border border-(--olivea-olive)/45 bg-(--olivea-cream) p-1.5">
        <span className="relative block h-full w-full">
          <Image src={h.emblem} alt="" fill sizes="32px" className="object-contain" />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-(--olivea-olive)"
          style={{ fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 600, lineHeight: 1.15 }}
        >
          {h.name}
        </span>
        <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-(--olivea-olive)/65">
          {h.cue[lang]}
        </span>
      </span>
      {children}
      <button
        type="button"
        onClick={onClose}
        aria-label={lang === "es" ? "Cerrar" : "Close"}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-(--olivea-olive) text-(--olivea-cream) shadow-sm transition-transform active:scale-95"
      >
        <X size={19} strokeWidth={1.6} />
      </button>
    </div>
  );
}

function MobileHotelSheet({
  lang,
  visible,
  onClose,
}: {
  lang: "es" | "en";
  visible: boolean;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: visible,
    onEscape: onClose,
  });

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label={lang === "es" ? "Casa Olivea — Reservaciones" : "Casa Olivea — Reservations"}
      className={`fixed inset-0 z-1400 bg-(--olivea-cream) flex flex-col transition-opacity duration-300 pwa-safe-top pwa-safe-bottom ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <SheetHeader house="hotel" lang={lang} onClose={onClose} />

      <div
        className="w-full flex-1 min-h-0 overflow-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
        onWheelCapture={stopWheelPropagation}
      >
        <CloudbedsWidget lang={lang} />
      </div>
    </div>
  );
}

/* ── Mobile Restaurant Overlay ───────────────────────────────────── */

function MobileRestaurantSheet({
  lang,
  visible,
  onClose,
}: {
  lang: "es" | "en";
  visible: boolean;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: visible,
    onEscape: onClose,
  });
  const reduce = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-label={lang === "es" ? "Olivea Farm To Table — Reservaciones" : "Olivea Farm To Table — Reservations"}
          className="fixed inset-0 z-1400 bg-(--olivea-cream) flex flex-col pwa-safe-top pwa-safe-bottom"
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.2, ease: EASE } }}
          exit={{ opacity: 0, y: reduce ? 0 : 16, transition: { duration: reduce ? 0 : 0.18, ease: EASE } }}
        >
          <SheetHeader house="restaurant" lang={lang} onClose={onClose}>
            <a
              href={openTableUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openOpenTableWindow}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-(--olivea-olive)/35 text-(--olivea-olive)"
              aria-label={lang === "es" ? "Abrir en OpenTable" : "Open on OpenTable"}
              title={lang === "es" ? "Abrir en OpenTable" : "Open on OpenTable"}
            >
              <ExternalLink size={17} />
            </a>
          </SheetHeader>

          <div className="w-full flex-1 min-h-0 overflow-hidden">
            <div className="w-full h-full">
              <OpentableWidget lang={lang} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── House chooser (phones) ──────────────────────────────────────── */

/**
 * What a phone shows when the guest has not chosen a house yet: the three
 * houses as a printed invitation, so reserving starts from OLIVEA as a whole
 * rather than from one booking engine.
 *
 * It used to repeat the home page cards (filled cream, drop shadow) without
 * the video and green button that frame them there, and read as the home page
 * stripped bare. Now: a fine double olive rule per house, the emblem set into
 * the frame like a seal, an action line, a press that inks the card, and the
 * three centred with a signature at the foot.
 */
function HouseChoice({
  lang,
  isMobile,
  onChoose,
}: {
  lang: "es" | "en";
  isMobile: boolean;
  onChoose: (id: ReservationType) => void;
}) {
  const reduce = usePrefersReducedMotion();

  return (
    <div
      className={`min-h-0 overflow-y-auto pt-2 ${
        isMobile ? "flex-1 px-4 pb-[max(env(safe-area-inset-bottom),24px)]" : "px-10 pb-6"
      }`}
      style={{
        background:
          "radial-gradient(120% 55% at 50% 0%, color-mix(in srgb, var(--olivea-olive) 7%, transparent), transparent 70%)",
        // Phones: the list's foot fades, so a house below the fold (on a small
        // screen, or once there are more houses) reads as "scroll for more".
        // When everything fits, the fade falls on empty padding.
        ...(isMobile
          ? {
              maskImage: "linear-gradient(to bottom, #000 calc(100% - 28px), transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 calc(100% - 28px), transparent)",
            }
          : {}),
      }}
    >
      <div className={`flex flex-col ${isMobile ? "min-h-full" : ""}`}>
        <p
          className="text-center italic text-(--olivea-ink)/75"
          style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 18 : 21 }}
        >
          {lang === "es" ? "¿Dónde te esperamos?" : "Where shall we welcome you?"}
        </p>
        <Ornament className="mt-3" />

        {/* Phones and tablets stack the houses as rows that share the screen's
            height (compact on a small phone, roomier with a photo on a wide
            one); desktop sets them side by side, as many columns as fit. */}
        <ul
          className={
            isMobile
              ? "my-5 flex flex-1 flex-col gap-3"
              : "mx-auto mt-7 mb-6 grid w-full max-w-5xl grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-5 lg:gap-7"
          }
        >
          {HOUSE_ORDER.map((id, i) => {
            const house = HOUSES[id];
            return (
              <motion.li
                key={id}
                className={isMobile ? "flex min-h-[88px] max-h-[240px] flex-1 min-[480px]:max-h-[260px]" : undefined}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE, delay: 0.08 + i * 0.08 }}
              >
                {isMobile ? (
                  // Phone and tablet: one row per house in the double olive
                  // frame. Rows share the height, so a tablet is not a narrow
                  // band of small rows in empty space, and a small phone still
                  // fits every house (88px each, with the browser's toolbars
                  // showing). From 480px wide the house's photo opens the
                  // row, its emblem set on the photo's edge like a seal.
                  <button
                    type="button"
                    onClick={() => onChoose(id)}
                    className={[
                      "group relative flex w-full items-stretch overflow-hidden rounded-[24px] text-left",
                      "border border-(--olivea-olive)/45",
                      "transition-[background-color,border-color,transform] duration-200",
                      "active:scale-[0.985] active:bg-(--olivea-olive) active:border-(--olivea-olive)",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/35 focus-visible:ring-offset-4 focus-visible:ring-offset-(--olivea-cream)",
                    ].join(" ")}
                  >
                    <span className="relative hidden w-[40%] shrink-0 overflow-hidden min-[480px]:block">
                      <Image src={house.photo} alt="" fill sizes="(max-width: 767px) 40vw, 300px" className="object-cover" />
                    </span>
                    {/* inner hairline: the second rule of the frame */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-1 z-10 rounded-[20px] border border-(--olivea-olive)/18 transition-colors duration-200 group-active:border-(--olivea-cream)/25 min-[480px]:border-(--olivea-cream)/40"
                    />
                    <span className="relative flex min-w-0 flex-1 items-center gap-3.5 py-3 pl-3.5 pr-3.5 min-[380px]:gap-4.5 min-[480px]:gap-5 min-[480px]:pl-0 min-[480px]:pr-6">
                      <span className="relative z-20 h-[clamp(64px,20vw,92px)] w-[clamp(64px,20vw,92px)] shrink-0 rounded-full border border-(--olivea-olive)/45 bg-(--olivea-cream) p-2.5 min-[380px]:p-3 min-[480px]:-ml-9 min-[480px]:h-[72px] min-[480px]:w-[72px]">
                        <span className="relative block h-full w-full">
                          <Image src={house.emblem} alt="" fill sizes="48px" className="object-contain" />
                        </span>
                      </span>
                      <span className="relative min-w-0 flex-1">
                        <span
                          // The text grows with the row: one line down to 320px
                          // phones, larger as the screen gives room.
                          className="block text-[clamp(17px,5.9vw,24px)] text-(--olivea-olive) transition-colors duration-200 group-active:text-(--olivea-cream) min-[480px]:text-[clamp(24px,4.4vw,32px)]"
                          style={{ fontFamily: "var(--font-serif)", fontWeight: 600, lineHeight: 1.12 }}
                        >
                          {house.name}
                        </span>
                        <span
                          className="mt-0.5 block text-[clamp(14.5px,4.2vw,17px)] italic text-(--olivea-olive)/75 transition-colors duration-200 group-active:text-(--olivea-cream)/85 min-[480px]:mt-1 min-[480px]:text-[clamp(17px,2.8vw,20px)]"
                          style={{ fontFamily: "var(--font-serif)", lineHeight: 1.3 }}
                        >
                          {house.descriptor[lang]}
                        </span>
                        <span className="mt-2 flex items-center gap-2 whitespace-nowrap text-[clamp(10px,2.9vw,11.5px)] font-semibold uppercase tracking-[0.2em] text-(--olivea-olive) transition-colors duration-200 group-active:text-(--olivea-cream) min-[480px]:mt-3.5 min-[480px]:text-[12.5px]">
                          {house.cue[lang]}
                          <span aria-hidden="true" className="transition-transform duration-200 group-active:translate-x-0.5">→</span>
                        </span>
                      </span>
                    </span>
                  </button>
                ) : (
                  // Desktop: the house's photograph inside the double olive
                  // frame, its emblem set on the photo's edge like a seal.
                  <button
                    type="button"
                    onClick={() => onChoose(id)}
                    className={[
                      "group relative flex h-full w-full flex-col rounded-[28px] p-1.5 text-center",
                      "border border-(--olivea-olive)/35 bg-white/30",
                      "transition-[border-color,box-shadow,transform] duration-300",
                      "hover:-translate-y-0.5 hover:border-(--olivea-olive)/70 hover:shadow-[0_24px_50px_-28px_rgba(40,60,35,0.55)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/35 focus-visible:ring-offset-4 focus-visible:ring-offset-(--olivea-cream)",
                    ].join(" ")}
                  >
                    <span className="relative block aspect-5/4 overflow-hidden rounded-[22px]">
                      <Image
                        src={house.photo}
                        alt=""
                        fill
                        sizes="(max-width: 1279px) 30vw, 340px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />
                    </span>
                    <span className="relative z-10 mx-auto -mt-7 h-14 w-14 rounded-full border border-(--olivea-olive)/45 bg-(--olivea-cream) p-2">
                      <span className="relative block h-full w-full">
                        <Image src={house.emblem} alt="" fill sizes="40px" className="object-contain" />
                      </span>
                    </span>
                    <span
                      className="mt-2 block px-3 text-(--olivea-olive)"
                      style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, lineHeight: 1.15 }}
                    >
                      {house.name}
                    </span>
                    <span
                      className="mt-0.5 block italic text-(--olivea-olive)/75"
                      style={{ fontFamily: "var(--font-serif)", fontSize: 15 }}
                    >
                      {house.descriptor[lang]}
                    </span>
                    <span className="mx-auto mt-auto inline-flex items-center gap-2 whitespace-nowrap pt-4 pb-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--olivea-olive) lg:text-[10.5px] lg:tracking-[0.24em]">
                      {house.cue[lang]}
                      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </span>
                  </button>
                )}
              </motion.li>
            );
          })}
        </ul>

        <Signature />
      </div>
    </div>
  );
}

/* ── Main Modal ──────────────────────────────────────────────────── */

interface ReservationModalProps {
  lang: "es" | "en";
  cafeHours?: CafeHours | null;
}

export default function ReservationModal({ lang, cafeHours }: ReservationModalProps) {
  const reduce = usePrefersReducedMotion();
  const {
    isOpen,
    closeReservationModal,
    reservationType,
    setReservationType,
    typeChosen,
    chooseAgain,
  } = useReservation();

  // Mobile vs desktop
  const [isMobile, setIsMobile] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width:767px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width:767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Body scroll lock + global modal flag
  useEffect(() => {
    if (!isOpen) return;
    setModalOpen(true);
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [isOpen]);

  // Escape closes the window wherever focus is. The inner sheets only heard
  // Escape when focus was inside them, and it is not moved there on open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReservationModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeReservationModal]);

  // Full-screen overlays (mobile only)
  const [showHotelOverlay, setShowHotelOverlay] = useState(false);
  const [showRestaurantOverlay, setShowRestaurantOverlay] = useState(false);
  const openRestaurantOverlay = useCallback(() => {
    setShowRestaurantOverlay(true);
  }, []);

  const closeRestaurantOverlay = useCallback(() => {
    setShowRestaurantOverlay(false);
  }, []);

  // Pre-mount panes
  const [mounted, setMounted] = useState({
    restaurant: false,
    hotel: false,
    cafe: false,
  });

  useEffect(() => {
    if (!isOpen) {
      // Keep restaurant + hotel mounted so the OpenTable and Cloudbeds panes
      // come back instantly instead of waiting on the idle remount below.
      setMounted((m) => ({
        restaurant: m.restaurant,
        hotel: m.hotel,
        cafe: false,
      }));
      setShowHotelOverlay(false);
      setShowRestaurantOverlay(false);
      return;
    }

    setMounted((m) => ({
      restaurant: m.restaurant || reservationType === "restaurant",
      hotel: true,
      cafe: m.cafe || reservationType === "cafe",
    }));

    return scheduleIdle(
      () => setMounted({ restaurant: true, hotel: true, cafe: true }),
      300
    );
  }, [isOpen, reservationType]);

  // Auto-open mobile overlays when the guest already chose a house (opened
  // from that house's page). Otherwise the phone shows the three houses.
  useEffect(() => {
    if (!isOpen || !isMobile || !typeChosen) return;
    if (reservationType === "hotel") setShowHotelOverlay(true);
    if (reservationType === "restaurant") openRestaurantOverlay();
  }, [isOpen, isMobile, typeChosen, reservationType, openRestaurantOverlay]);

  // On a phone, closing a booking sheet goes back to the three houses.
  const closeHotelSheet = useCallback(() => {
    setShowHotelOverlay(false);
    chooseAgain();
  }, [chooseAgain]);
  const closeRestaurantSheet = useCallback(() => {
    closeRestaurantOverlay();
    chooseAgain();
  }, [closeRestaurantOverlay, chooseAgain]);

  // A window opened from a page that belongs to no house (the home page, a
  // journal post…) asks which house first, on every screen size.
  const showChoice = !typeChosen;

  // Tab handler
  const handleTabClick = useCallback(
    (id: ReservationType) => {
      setReservationType(id);
      if (!isMobile) return;
      if (id === "hotel") setShowHotelOverlay(true);
      if (id === "restaurant") openRestaurantOverlay();
    },
    [isMobile, setReservationType, openRestaurantOverlay]
  );

  // Transitions
  const enterT: Transition = reduce
    ? { duration: 0 }
    : isMobile
      ? { type: "spring", stiffness: 210, damping: 26, mass: 0.9 }
      : { duration: 0.42, ease: EASE, delay: 0.06 };
  const exitT: Transition = reduce
    ? { duration: 0 }
    : isMobile
      ? { type: "spring", stiffness: 210, damping: 26, mass: 0.9 }
      : { duration: 0.42, ease: EASE };

  const panelVariants: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: enterT },
        exit: { opacity: 0, transition: exitT },
      }
    : isMobile
      ? {
          hidden: { y: "100%", opacity: 0 },
          visible: { y: 0, opacity: 1, transition: enterT },
          exit: { y: "100%", opacity: 0, transition: exitT },
        }
      : {
          hidden: { scale: 0.9, opacity: 0 },
          visible: { scale: 1.0, opacity: 1, transition: enterT },
          exit: { scale: 0.9, opacity: 0, transition: exitT },
        };

  const backdropT: Transition = { duration: reduce ? 0 : 0.28, ease: EASE };

  // Desktop-only full screen. The booking engines are dense — Cloudbeds' room
  // grid and OpenTable's slot picker both benefit from the extra room — so let
  // the panel grow to the viewport. Mobile already has its own full-screen
  // sheets (MobileHotelSheet / MobileRestaurantSheet) and is left alone.
  //
  // This toggles CSS classes ONLY. The pane subtree must not change shape or
  // React remounts the iframes and the guest loses a half-finished booking.
  const [expanded, setExpanded] = useState(false);

  // Animate the resize only when the user actually clicks the toggle. The
  // stored preference can only be read after mount (no localStorage during SSR,
  // and a useState initializer would desync hydration), so a remembered
  // "expanded" always arrives one render late — and React batches it with any
  // flag set in the same effect. Gating on the restore therefore still plays a
  // pointless windowed -> full-screen morph on every open. Gating on the click
  // is the only thing that separates the two cases.
  const [animateResize, setAnimateResize] = useState(false);

  // Remember the choice — someone who wants the big widget wants it next time.
  useEffect(() => {
    try {
      setExpanded(localStorage.getItem(FULLSCREEN_KEY) === "1");
    } catch {
      /* private mode / storage disabled — default to windowed */
    }
  }, []);

  const toggleExpanded = useCallback(() => {
    setAnimateResize(true);
    setExpanded((prev) => {
      try {
        localStorage.setItem(FULLSCREEN_KEY, prev ? "0" : "1");
      } catch {
        /* non-fatal: the toggle still works for this session */
      }
      return !prev;
    });
  }, []);

  // Controlled presence
  const [present, setPresent] = useState(false);
  useEffect(() => {
    if (isOpen) setPresent(true);
  }, [isOpen]);

  if (!isOpen && !present) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1200"
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={backdropT}
        aria-hidden
        onClick={closeReservationModal}
        style={{ willChange: "opacity" }}
      />

      {/* Panel */}
      <motion.div
        className={`fixed inset-0 z-1300 flex ${
          isMobile
            ? "items-end justify-center"
            : `items-center justify-center ${expanded ? "p-0" : "p-4"}`
        }`}
        style={{ willChange: "transform, opacity", contain: "layout paint style" }}
        variants={panelVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "exit"}
        onAnimationComplete={() => {
          if (!isOpen) setPresent(false);
        }}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "es" ? "Reservaciones" : "Reservations"}
      >
        <div
          className={`bg-(--olivea-cream) flex flex-col overflow-hidden ${
            reduce || !animateResize
              ? ""
              : "transition-[width,height,border-radius] duration-300 ease-out"
          } ${
            isMobile
              ? "w-full h-full rounded-none"
              : expanded
                ? "w-full h-full max-w-none rounded-none"
                : // The chooser sizes the window to its cards; a booking
                  // engine needs the full height.
                  `w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl rounded-2xl ${showChoice ? "max-h-[90vh]" : "h-[90vh]"}`
          }`}
        >
          {/* Header */}
          <div className={`relative flex items-center px-6 shrink-0 ${isMobile ? "py-4" : "h-20"}`}>
            <h2 className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {!isMobile && (
                <span className="text-[11px] uppercase tracking-[0.42em] text-(--olivea-olive)/80">
                  Olivea
                </span>
              )}
              <span
                className="uppercase tracking-[0.2em] sm:tracking-[0.25em]"
                style={{
                  fontFamily: "var(--font-serif)",
                  // Narrow phones: smaller, so "RESERVACIONES" clears the close button.
                  fontSize: isMobile ? "clamp(17px, 5.6vw, 22px)" : 28,
                  fontWeight: 200,
                }}
              >
                {lang === "es" ? "Reservaciones" : "Reservations"}
              </span>
            </h2>
            <div className="ml-auto flex items-center gap-1">
              {!isMobile && (
                <button
                  type="button"
                  onClick={toggleExpanded}
                  aria-pressed={expanded}
                  aria-label={
                    expanded
                      ? lang === "es"
                        ? "Salir de pantalla completa"
                        : "Exit full screen"
                      : lang === "es"
                        ? "Pantalla completa"
                        : "Full screen"
                  }
                  title={
                    expanded
                      ? lang === "es"
                        ? "Salir de pantalla completa"
                        : "Exit full screen"
                      : lang === "es"
                        ? "Pantalla completa"
                        : "Full screen"
                  }
                  className="p-2 rounded-full hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
                >
                  {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              )}
              <button
                onClick={closeReservationModal}
                aria-label={lang === "es" ? "Cerrar" : "Close"}
                className="p-2 rounded-full hover:bg-(--olivea-olive) hover:text-(--olivea-cream) transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {showChoice && <HouseChoice lang={lang} isMobile={isMobile} onChoose={handleTabClick} />}

          {/* Tabs, named after the houses. Kept mounted (only hidden) while the
              chooser shows, so the panes never remount. */}
          <div
            role="tablist"
            className={`shrink-0 bg-(--olivea-cream) ${showChoice ? "hidden" : "flex"} ${
              isMobile ? "px-4" : "gap-3 px-6 pb-3"
            }`}
          >
            {HOUSE_ORDER.map((id) => {
              const active = reservationType === id;
              const house = HOUSES[id];
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  onClick={() => handleTabClick(id)}
                  aria-selected={active}
                  className={`group relative flex flex-1 items-center whitespace-nowrap transition-colors ${
                    isMobile
                      ? "flex-col justify-center gap-1 py-2"
                      : // Slim pills: the booking below gets the height.
                        "gap-3 rounded-full py-1.5 pl-1.5 pr-5 text-left"
                  } ${
                    active
                      ? "text-(--olivea-olive)"
                      : isMobile
                        ? "text-(--olivea-ink)"
                        : "text-(--olivea-ink)/75 hover:bg-(--olivea-olive)/6 hover:text-(--olivea-ink)"
                  }`}
                >
                  {/* The selected house sits on a raised card (desktop) or an
                      underline (phone) that slides from house to house. */}
                  {active && (
                    <motion.span
                      layoutId="reservation-tab"
                      aria-hidden
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                      className={
                        isMobile
                          ? "absolute bottom-0 left-0 right-0 h-0.75 bg-(--olivea-olive)"
                          : "absolute inset-0 rounded-full border border-(--olivea-olive)/45 bg-white/25"
                      }
                    />
                  )}
                  <span
                    aria-hidden
                    className={`relative shrink-0 overflow-hidden ${
                      isMobile
                        ? "h-6 w-6"
                        : `h-9 w-9 rounded-full border bg-(--olivea-cream) p-1.5 ${
                            active ? "border-(--olivea-olive)/45" : "border-(--olivea-olive)/20"
                          }`
                    } ${active ? "" : "opacity-70"}`}
                  >
                    {/* inner box so the seal's padding frames the emblem */}
                    <span className="relative block h-full w-full">
                      <Image src={house.emblem} alt="" fill sizes="36px" className="object-contain" />
                    </span>
                  </span>
                  {isMobile ? (
                    <span className="relative" style={{ fontFamily: "var(--font-serif)", fontSize: 13 }}>
                      {house.tab}
                    </span>
                  ) : (
                    <span className="relative flex min-w-0 flex-col leading-tight">
                      <span
                        className={`truncate uppercase tracking-[0.14em] ${active ? "font-semibold" : ""}`}
                        style={{ fontFamily: "var(--font-serif)", fontSize: 14 }}
                      >
                        {house.tab}
                      </span>
                      <span
                        className="truncate italic opacity-75"
                        style={{ fontFamily: "var(--font-serif)", fontSize: 12.5 }}
                      >
                        {house.descriptor[lang]}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Panes */}
          <div className={`flex-1 min-h-0 flex-col bg-(--olivea-cream) ${showChoice ? "hidden" : "flex"}`}>
            <div
              className={`flex-1 min-h-0 flex flex-col ${reservationType === "hotel" ? "flex" : "hidden"}`}
              aria-hidden={reservationType !== "hotel"}
            >
              <HotelPane
                lang={lang}
                isMobile={isMobile}
                mounted={mounted.hotel}
                onOpenOverlay={() => setShowHotelOverlay(true)}
              />
            </div>

            <div
              className={`flex-1 min-h-0 flex flex-col ${reservationType === "restaurant" ? "flex" : "hidden"}`}
              aria-hidden={reservationType !== "restaurant"}
            >
              <RestaurantPane
                lang={lang}
                isMobile={isMobile}
                mounted={mounted.restaurant}
                onOpenOverlay={openRestaurantOverlay}
              />
            </div>

            <div
              className={`flex-1 min-h-0 flex flex-col ${reservationType === "cafe" ? "flex" : "hidden"}`}
              aria-hidden={reservationType !== "cafe"}
            >
              <CafePane lang={lang} cafeHours={cafeHours} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile full-screen overlays */}
      {isMobile && mounted.hotel && (
        <MobileHotelSheet
          lang={lang}
          visible={showHotelOverlay}
          onClose={closeHotelSheet}
        />
      )}

      {isMobile && (
        <MobileRestaurantSheet
          lang={lang}
          visible={showRestaurantOverlay}
          onClose={closeRestaurantSheet}
        />
      )}
    </>
  );
}
