"use client";

// components/ui/InstagramChooser.tsx
// ─────────────────────────────────────────────────────────────────────
// OLIVEA has three Instagram accounts, one per house. The Instagram icon
// (desktop footer, phone menu) used to open only the restaurant's; it now opens
// a small card asking which house, each with its emblem, name and @handle.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { HOUSES, HOUSE_INSTAGRAM, HOUSE_ORDER } from "@/lib/houses";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type Props = {
  lang: "es" | "en";
  /** The icon the trigger shows, styled by the caller to match its row. */
  children: ReactNode;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  /** Draw the card inline instead of at page level. The phone menu uses it:
   *  its focus trap would keep the keyboard out of a page-level card, and the
   *  menu already sits above everything. */
  inline?: boolean;
};

const CARD_W = 256;

export default function InstagramChooser({ lang, children, triggerClassName, triggerStyle, inline = false }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const reduce = usePrefersReducedMotion();

  // Page level, the card is placed above the icon. Drawn inside the footer it
  // sat in the footer's layer, under the promo bar.
  const [place, setPlace] = useState<{ left: number; bottom: number } | null>(null);
  useLayoutEffect(() => {
    if (!open || inline) return;
    const measure = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const left = Math.min(Math.max(8, r.left + r.width / 2 - CARD_W / 2), window.innerWidth - CARD_W - 8);
      setPlace({ left, bottom: window.innerHeight - r.top + 10 });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, inline]);

  // Close on a tap outside or Escape (focus returns to the icon).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const title = lang === "es" ? "Síguenos en Instagram" : "Follow us on Instagram";

  const panel = (
    <AnimatePresence>
      {open && (inline || place) ? (
        <motion.div
          ref={panelRef}
          id={panelId}
          role="group"
          aria-label={title}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transformOrigin: "bottom center",
            width: CARD_W,
            ...(inline || !place ? {} : { left: place.left, bottom: place.bottom }),
          }}
          className={cn(
            // Page level: above the promo bar, below modals.
            inline ? "absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2" : "fixed z-1100",
            "rounded-2xl bg-(--olivea-cream) p-2 text-left",
            "ring-1 ring-(--olivea-olive)/18 shadow-[0_22px_50px_-24px_rgba(40,60,35,0.55)]"
          )}
        >
          {/* A span, not a <p>: the site's paragraph rules restyle every <p>. */}
          <span
            className="block px-2.5 pt-1.5 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-(--olivea-olive)/75"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {title}
          </span>
          <ul>
            {HOUSE_ORDER.map((id) => {
              const house = HOUSES[id];
              const handle = HOUSE_INSTAGRAM[id];
              return (
                <li key={id}>
                  <a
                    href={`https://www.instagram.com/${handle}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-2.5 py-2",
                      "text-(--olivea-olive) transition-colors",
                      "hover:bg-(--olivea-olive)/8 focus-visible:bg-(--olivea-olive)/8 focus-visible:outline-none"
                    )}
                  >
                    <span className="relative h-9 w-9 shrink-0 rounded-full bg-white/70 p-1.5 ring-1 ring-(--olivea-olive)/15">
                      <span className="relative block h-full w-full">
                        <Image src={house.emblem} alt="" fill sizes="24px" className="object-contain" />
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block truncate leading-tight"
                        style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600 }}
                      >
                        {house.name}
                      </span>
                      <span className="block truncate text-[12px] text-(--olivea-olive)/70" style={{ fontFamily: "var(--font-sans)" }}>
                        @{handle}
                      </span>
                    </span>
                    <span aria-hidden="true" className="ml-auto text-(--olivea-olive)/50">
                      ↗
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={lang === "es" ? "Instagram: elige la casa" : "Instagram: choose the house"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={triggerClassName}
        style={triggerStyle}
      >
        {children}
      </button>
      {inline ? panel : typeof document !== "undefined" ? createPortal(panel, document.body) : null}
    </div>
  );
}
