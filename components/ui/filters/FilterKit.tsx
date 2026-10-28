"use client";

// The one set of parts every filter on the site is built from: the phone bar
// and sheet (Press, Journal, Team) and the chips and search of the desktop
// docks. They were three designs that had drifted apart: a serif "Filtrar"
// with a square close on Press, tabs and accordions on Journal, a round close
// on Team, and chips in three sizes. One look now, from one place.

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import BodyPortal from "@/components/ui/BodyPortal";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";
import { UNDER_LOGO } from "@/components/layout/logoGeometry";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Chips ─────────────────────────────────────────────────────────── */

/** md on phones (a comfortable tap), sm in the desktop docks. */
export type ChipSize = "sm" | "md";

const chipSize: Record<ChipSize, string> = {
  sm: "px-2.5 py-1 text-[12px]",
  md: "px-3 py-2 text-[13px]",
};

export function chipClass(active: boolean, size: ChipSize = "md") {
  return cn(
    "rounded-full leading-none ring-1 transition text-(--olivea-olive)",
    chipSize[size],
    active
      ? "bg-white/75 ring-(--olivea-olive)/45 font-medium"
      : "bg-white/16 ring-(--olivea-olive)/14 hover:bg-white/26"
  );
}

export function FilterChip({
  active,
  onClick,
  size = "md",
  children,
}: {
  active: boolean;
  onClick: () => void;
  size?: ChipSize;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={chipClass(active, size)}>
      {children}
    </button>
  );
}

/** A labelled row of chips (or anything else). */
export function FilterGroup({
  label,
  action,
  children,
  className,
}: {
  label: string;
  /** Optional link on the right of the label ("Más"). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className={filterLabel}>{label}</div>
        {action}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export const filterLabel = "text-[11px] uppercase tracking-[0.26em] text-(--olivea-olive)";

/** The small underlined link the groups use ("Más", "Limpiar filtros"). */
export const filterLink = "text-[12px] text-(--olivea-olive) underline underline-offset-4";

/* ── Search ────────────────────────────────────────────────────────── */

export function FilterSearch({
  value,
  onChange,
  placeholder,
  label,
  clearLabel,
  onFocus,
  onBlur,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  /** The field's accessible name (the placeholder disappears as you type). */
  label: string;
  clearLabel: string;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3.5 py-2",
        "bg-white/22 ring-1 ring-(--olivea-olive)/16 backdrop-blur-[2px]",
        // The rounded field carries the focus ring, not the global square one.
        "focus-within:ring-2 focus-within:ring-(--olivea-olive)/45",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-(--olivea-olive)" aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-label={label}
        className="focus-custom w-full min-w-0 bg-transparent text-[13px] text-(--olivea-olive) outline-none placeholder:text-(--olivea-clay)/65"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/30 text-(--olivea-olive) transition hover:bg-white/45"
          aria-label={clearLabel}
          title={clearLabel}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/* ── Phone bar ─────────────────────────────────────────────────────── */

/** The frosted bar under the navbar on phones; hides as you scroll down. */
export function FilterBar({
  hidden,
  top,
  className,
  children,
}: {
  hidden: boolean;
  /** Pixel offset from the top, when the page computes one. */
  top?: number;
  /** Visibility and placement classes (md:hidden, z-index, top-14…). */
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={cn("fixed left-0 right-0 pointer-events-none", className)}
      style={top !== undefined ? { top } : undefined}
      animate={hidden ? "hidden" : "show"}
      variants={{ show: { y: 0, opacity: 1 }, hidden: { y: -48, opacity: 0 } }}
      transition={{ duration: hidden ? 0.38 : 0.18, ease: EASE }}
    >
      <div className="px-3 pt-2 pointer-events-auto">
        <div className="rounded-2xl bg-(--olivea-cream)/72 ring-1 ring-(--olivea-olive)/14 shadow-[0_10px_30px_rgba(18,24,16,0.10)] backdrop-blur-md">
          <div className="flex items-center gap-2 px-2.5 py-2">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

/** The round button that opens the sheet; shows how many filters are on. */
export function FilterButton({
  onClick,
  label,
  activeCount = 0,
  icon,
}: {
  onClick: () => void;
  label: string;
  activeCount?: number;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md",
        "text-(--olivea-olive) transition hover:bg-white/45"
      )}
      aria-label={label}
      title={label}
    >
      {icon ?? <SlidersHorizontal className="h-4 w-4" />}
      {activeCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-(--olivea-olive) px-1 text-[11px] font-medium text-(--olivea-cream)">
          {activeCount}
        </span>
      ) : null}
    </button>
  );
}

/* ── Phone sheet ───────────────────────────────────────────────────── */

/**
 * The bottom sheet every filter opens on a phone. At the end of <body>
 * (BodyPortal), so the floating section dock and the promo bar cannot sit on
 * top of it; locks the page underneath and tells the site a modal is open
 * (the roseiies orb steps aside). Escape, the backdrop, the close button or
 * a swipe down closes it. Its body scrolls only if a small phone needs it.
 */
export function FilterSheet({
  open,
  onClose,
  title,
  closeLabel,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  /** Stays at the bottom while the body scrolls (SheetFooter). */
  footer?: ReactNode;
  children: ReactNode;
}) {
  // Swiped down by its handle and title, so dragging never fights the body's
  // own scrolling on a small phone.
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    setModalOpen(true);
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [open, onClose]);

  return (
    <BodyPortal>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-1200 bg-black/25 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-label={closeLabel}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-1201 flex max-h-[85dvh] flex-col pointer-events-auto",
                "rounded-t-3xl bg-(--olivea-cream)/94 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md",
                "shadow-[0_-16px_40px_rgba(18,24,16,0.18)]"
              )}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: EASE }}
              drag="y"
              dragControls={drag}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 800) onClose();
              }}
            >
              <div className="shrink-0 touch-none px-4 pt-3" onPointerDown={(e) => drag.start(e)}>
                <div className="mx-auto h-1 w-12 rounded-full bg-(--olivea-olive)/18" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive)">{title}</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/40 text-(--olivea-olive) ring-1 ring-(--olivea-olive)/14 transition hover:bg-white/55"
                    aria-label={closeLabel}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="olivea-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-4">
                <div className="space-y-5">{children}</div>
              </div>

              <div className="shrink-0 px-4 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </BodyPortal>
  );
}

/** Limpiar on the left (only while something is filtered), Listo on the right. */
export function SheetFooter({
  onClear,
  clearLabel,
  onDone,
  doneLabel,
}: {
  onClear?: () => void;
  clearLabel: string;
  onDone: () => void;
  doneLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 border-t border-(--olivea-olive)/10 pt-3">
      <button
        type="button"
        onClick={onClear}
        disabled={!onClear}
        className="rounded-2xl bg-white/35 px-4 py-3 text-[13px] text-(--olivea-olive) ring-1 ring-(--olivea-olive)/14 transition hover:bg-white/45 disabled:opacity-50"
      >
        {clearLabel}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="rounded-2xl bg-(--olivea-olive) px-4 py-3 text-[13px] text-(--olivea-cream) ring-1 ring-black/10 transition hover:brightness-[1.03]"
      >
        {doneLabel}
      </button>
    </div>
  );
}

/** A "go to section" row inside a sheet. */
export function JumpRow({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-2xl bg-white/35 px-4 py-3 text-left text-(--olivea-olive) ring-1 ring-(--olivea-olive)/14 transition hover:bg-white/45"
    >
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
}

/* ── Desktop docks ─────────────────────────────────────────────────── */

/** Where every desktop dock starts: a clear gap under the logo, which grows
 *  with the screen (CSS, from components/layout/logoGeometry). */
export const DOCK_TOP = UNDER_LOGO;

/** The docks' frosted card (Press, Journal, Team). */
export const dockShell =
  "rounded-3xl bg-(--olivea-cream)/62 backdrop-blur-md ring-1 ring-(--olivea-olive)/14 shadow-[0_10px_28px_rgba(18,24,16,0.10)]";

/** A panel that opens beside a dock, over the page: near-solid, not glass. */
export const sidePanel =
  "rounded-3xl bg-(--olivea-cream)/96 backdrop-blur-md ring-1 ring-(--olivea-olive)/16 shadow-[0_18px_40px_-12px_rgba(18,24,16,0.28)]";

/** The square-ish icon buttons in a dock's header. */
export const dockIconButton =
  "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/16 text-(--olivea-olive) ring-1 ring-(--olivea-olive)/14 transition hover:bg-white/24";

/**
 * A dock's first line: what it filters, how many, and its buttons. `stacked`
 * puts the count under the label, for a dock narrower than the line.
 */
export function DockHeader({
  label,
  meta,
  stacked = false,
  children,
}: {
  label: string;
  meta?: ReactNode;
  stacked?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className={cn("flex min-w-0", stacked ? "flex-col gap-1" : "items-baseline gap-2")}>
        <span className={filterLabel}>{label}</span>
        {meta ? <span className="truncate text-[12px] tabular-nums text-(--olivea-olive)">{meta}</span> : null}
      </div>
      {children ? <div className="flex items-center gap-1.5">{children}</div> : null}
    </div>
  );
}
