// components/ui/popup/PopupHost.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useReservation } from "@/contexts/ReservationContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { isStampFresh, setStamp } from "@/lib/storage";
import { isVotePath } from "@/lib/mexbest";

/**
 * What the primary button does. A link navigates; an action opens something
 * that is already on the page — the reservation modal for a given venue.
 * Set, it wins over href, because sending someone to a page to find the
 * booking button is a worse version of opening the booking button.
 */
export type PopupAction = "hotel" | "restaurant" | "cafe";

export type SitePopup =
  | {
      id: string;
      kind: "journal";
      lang: "es" | "en";
      title: string;
      excerpt: string;
      href: string;
      action?: PopupAction;
      phone?: string;
      coverSrc?: string;
      coverAlt?: string;
      videoSrc?: string;
      badge?: string;
      ctaLabel?: string;
      frequency?: "onceEver" | "oncePerPopupId" | "oncePerDays";
      days?: number;
    }
  | {
      id: string;
      kind: "announcement";
      lang: "es" | "en";
      title: string;
      excerpt: string;
      href?: string;
      action?: PopupAction;
      phone?: string;
      // Announcements used to render no media at all, so a cover uploaded
      // for one silently went nowhere. They now carry the same media as a
      // journal popup.
      coverSrc?: string;
      coverAlt?: string;
      videoSrc?: string;
      badge?: string;
      ctaLabel?: string;
      frequency?: "onceEver" | "oncePerPopupId" | "oncePerDays";
      days?: number;
    };

type PopupApiResponse = { popup: SitePopup | null };

const STORAGE_PREFIX = "olivea:popup:seen:";

function scheduleAfterInteractive(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & {
    requestIdleCallback?: (fn: () => void, opts?: { timeout?: number }) => number;
  };

  const t = window.setTimeout(() => {
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(cb, { timeout: 1200 });
      return;
    }
    cb();
  }, 900);

  return () => window.clearTimeout(t);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isSitePopup(v: unknown): v is SitePopup {
  if (!isObject(v)) return false;

  if (typeof v.id !== "string") return false;
  if (v.kind !== "journal" && v.kind !== "announcement") return false;
  if (v.lang !== "es" && v.lang !== "en") return false;
  if (typeof v.title !== "string") return false;
  if (typeof v.excerpt !== "string") return false;

  if (v.coverSrc != null && typeof v.coverSrc !== "string") return false;
  if (v.coverAlt != null && typeof v.coverAlt !== "string") return false;
  if (v.videoSrc != null && typeof v.videoSrc !== "string") return false;
  if (v.ctaLabel != null && typeof v.ctaLabel !== "string") return false;
  if (v.days != null && typeof v.days !== "number") return false;
  if (v.action != null && v.action !== "hotel" && v.action !== "restaurant" && v.action !== "cafe")
    return false;
  if (v.phone != null && typeof v.phone !== "string") return false;

  if (v.kind === "journal") {
    if (typeof v.href !== "string") return false;
    if (v.coverSrc != null && typeof v.coverSrc !== "string") return false;
    if (v.coverAlt != null && typeof v.coverAlt !== "string") return false;
    if (v.badge != null && typeof v.badge !== "string") return false;
    return true;
  }

  if (v.href != null && typeof v.href !== "string") return false;
  if (v.badge != null && typeof v.badge !== "string") return false;
  return true;
}

export default function PopupHost() {
  const pathname = usePathname();
  const lang: "es" | "en" = pathname?.startsWith("/en") ? "en" : "es";
  const reduce = useReducedMotion();
  // On mobile the popup is a bottom sheet, and a sheet with a grab handle is
  // expected to be dismissible by dragging it down. Desktop renders a centred
  // dialog, where dragging would be meaningless. Reduced motion keeps the
  // close button as the only way out rather than animating the sheet away.
  const isMobile = useIsMobile();
  const dragToDismiss = isMobile && !reduce;
  const { openReservationModal } = useReservation();

  const [popup, setPopup] = useState<SitePopup | null>(null);
  const [open, setOpen] = useState(false);
  // The cover is painted underneath the video and the video fades in over it
  // once it can actually play, so the media area is never empty and never
  // pops. If the video fails — a bad encode, a blocked host, a codec the
  // browser will not take — the cover simply stays, which is a far better
  // outcome than the black rectangle that used to be left behind.
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const closeRef = useRef<HTMLButtonElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: () => setOpen(false),
    initialFocusRef: closeRef,
  });

  // The card is aria-modal, so the page behind it must not scroll.
  useScrollLock(open);

  // Fetch active popup (single file via /api/popup, rule-aware using path)
  useEffect(() => {
    // The Reader's Choice vote page is a single fixed screen whose whole job is
    // one tap. A popup over it would cover the ask, and the lookup is a request
    // we can skip entirely rather than fetch and then discard.
    const p = pathname ?? "/";
    if (isVotePath(p)) {
      setPopup(null);
      return;
    }

    const controller = new AbortController();
    const url = `/api/popup?lang=${lang}&path=${encodeURIComponent(p)}`;

    fetch(url, { cache: "default", signal: controller.signal })
      .then((r) => r.json() as Promise<unknown>)
      .then((dataUnknown) => {
        if (controller.signal.aborted) return;

        if (!isObject(dataUnknown) || !("popup" in dataUnknown)) {
          setPopup(null);
          return;
        }

        const maybe = (dataUnknown as PopupApiResponse).popup;
        setPopup(maybe && isSitePopup(maybe) ? maybe : null);
      })
      .catch((err) => {
        // Ignore AbortError (expected on unmount / route change)
        if (err?.name === "AbortError") return;
        setPopup(null);
      });

    return () => controller.abort();
  }, [lang, pathname]);

  // A different popup means a different clip, so the readiness of the last
  // one says nothing about this one.
  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
  }, [popup?.videoSrc]);

  // "onceEver" means once across all popups, so it cannot be keyed by id.
  const key = useMemo(() => {
    if (!popup) return "";
    return popup.frequency === "onceEver"
      ? `${STORAGE_PREFIX}__ever__`
      : `${STORAGE_PREFIX}${popup.id}`;
  }, [popup]);

  // How long a dismissal counts for. Undefined means forever, which is what
  // "once ever" and "once per popup" both mean; oncePerDays expires.
  const suppressDays = useMemo(() => {
    if (!popup) return undefined;
    if (popup.frequency !== "oncePerDays") return undefined;
    return typeof popup.days === "number" && popup.days > 0 ? popup.days : 1;
  }, [popup]);

  const close = useCallback(() => {
    setOpen(false);
    if (popup) setStamp(key);
  }, [key, popup]);

  useEffect(() => {
    if (!popup) return;

    // Extra safeguard: never show on journal pages
    if (pathname?.includes("/journal")) return;

    if (isStampFresh(key, suppressDays)) return;

    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;

    const cancel = scheduleAfterInteractive(() => setOpen(true));

    return () => {
      cancel?.();
    };
  }, [popup, key, close, pathname, suppressDays]);

  if (!popup) return null;

  const coverSrc = popup.coverSrc;
  const coverAlt = popup.coverAlt;
  const videoSrc = popup.videoSrc;
  const es = popup.lang === "es";

  // A popup that moves on its own is exactly what "reduce motion" is about,
  // so the loop is skipped for anyone who asked for that and the cover is
  // shown instead.
  const showVideo = Boolean(videoSrc) && !reduce && !videoFailed;

  // Both buttons in the row share this so the primary one looks the same
  // whether it navigates or opens the booking modal.
  const primaryCta = [
    "w-full md:w-auto",
    "inline-flex items-center justify-center",
    "rounded-2xl px-4 py-3.5 md:py-3",
    "bg-(--olivea-olive) text-white",
    "text-[12px] uppercase tracking-[0.28em]",
    "shadow-[0_14px_34px_-20px_rgba(0,0,0,0.45)]",
    "hover:opacity-95 transition",
  ].join(" ");

  // Naming the venue beats a bare "Reservar": someone reading an offer about
  // a stay wants to see the word for the thing they are about to book.
  const defaultActionLabel =
    popup.action === "hotel"
      ? es ? "Reservar hospedaje" : "Book a stay"
      : popup.action === "restaurant"
        ? es ? "Reservar mesa" : "Book a table"
        : es ? "Reservar en el café" : "Book at the café";

  // Motion: calm, natural
  const backdropVariants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, backdropFilter: "blur(0px)" },
        show: {
          opacity: 1,
          // 6px pushed the page behind into an unreadable wash, and the card
          // sits on its own near-opaque plane so it does not need the
          // separation. 3px still reads as depth without hiding the site.
          backdropFilter: "blur(3px)",
          transition: { duration: 0.32, ease: [0.19, 1, 0.22, 1] },
        },
        exit: { opacity: 0, transition: { duration: 0.22 } },
      };

  const cardVariants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 16, scale: 0.996, filter: "blur(10px)" },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 240, damping: 28, mass: 0.9 },
        },
        exit: {
          opacity: 0,
          y: 10,
          scale: 0.997,
          filter: "blur(10px)",
          transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] },
        },
      };

  const stagger: Variants = reduce
    ? { hidden: {}, show: {} }
    : { hidden: {}, show: { transition: { delayChildren: 0.05, staggerChildren: 0.06 } } };

  const item: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8, filter: "blur(8px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.42, ease: [0.19, 1, 0.22, 1] },
        },
      };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Light glass backdrop */}
          <motion.button
            type="button"
            className="fixed inset-0 z-9998 bg-white/6"
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={close}
            aria-label={popup.lang === "es" ? "Cerrar" : "Close"}
          />

          <div ref={trapRef} className="fixed inset-0 z-9999 flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              role="dialog"
              aria-modal="true"
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
              /* Swipe the sheet down to dismiss. Constrained to y with no
                 upward travel, so the sheet cannot be dragged off the top of
                 its own position; the elastic only gives downward. Nothing
                 inside the card scrolls, so taking over the vertical gesture
                 costs no scrolling behaviour. */
              drag={dragToDismiss ? "y" : false}
              dragDirectionLock
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              dragMomentum={false}
              onDragEnd={(_, info: PanInfo) => {
                // Either a deliberate pull or a quick flick dismisses it.
                // Distance alone would ignore a fast short flick, and velocity
                // alone would fire on an accidental brush.
                if (info.offset.y > 96 || info.velocity.y > 650) close();
              }}
              className={[
                "relative w-full md:max-w-160",
                "rounded-t-[28px] md:rounded-[28px]",
                "overflow-hidden",
                // anchored light plane (prevents muddy tint pickup)
                "bg-(--olivea-cream)/88 md:bg-(--olivea-cream)/80",
                "backdrop-blur-md",
                "ring-1 ring-(--olivea-olive)/12",
                "shadow-[0_24px_80px_-36px_rgba(0,0,0,0.35)]",
                "pb-[max(env(safe-area-inset-bottom),14px)]",
              ].join(" ")}
            >
              {/* subtle top sheen */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-linear-to-b from-white/18 via-transparent to-transparent opacity-80" />
              </div>

              {/* Mobile handle. Given a real grab area — the visible bar is
                  4px tall, which is far below a comfortable touch target, and
                  the padding around it is what a thumb actually lands on. */}
              <div
                className={[
                  "relative md:hidden pt-3 pb-2 flex justify-center",
                  dragToDismiss ? "cursor-grab active:cursor-grabbing" : "",
                ].join(" ")}
                aria-hidden
              >
                <div className="h-1 w-12 rounded-full bg-(--olivea-olive)/25" />
              </div>

              {/* Header */}
              <motion.div
                className="relative px-5 md:px-7 pt-4 flex items-center justify-between"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                <motion.span
                  variants={item}
                  className="text-[11px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-90"
                >
                  {popup.badge ?? (popup.lang === "es" ? "Nuevo" : "New")}
                </motion.span>

                {/* Close button (optically centered X) */}
                <motion.button
                  ref={closeRef}
                  variants={item}
                  type="button"
                  onClick={close}
                  aria-label={popup.lang === "es" ? "Cerrar" : "Close"}
                  className={[
                    "relative",
                    "h-10 w-10",
                    "rounded-full",
                    "bg-white/70",
                    "ring-1 ring-(--olivea-olive)/15",
                    "text-(--olivea-olive)",
                    "transition",
                    "hover:bg-white/85",
                    "flex items-center justify-center",
                  ].join(" ")}
                  whileHover={reduce ? undefined : { scale: 1.03 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                >
                  <X
                    size={18}
                    strokeWidth={1.75}
                    className="translate-x-[0.5px] translate-y-[0.5px]"
                  />
                </motion.button>
              </motion.div>

              {/* Body */}
              <motion.div
                className="relative px-5 md:px-7 pb-6 md:pb-7"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {/* Media — a silent loop when one is set, otherwise the
                    cover. The loop is muted and inline because no browser
                    autoplays anything else, and it is skipped entirely for
                    anyone who has asked their device to reduce motion: a
                    popup that moves on its own is exactly what that setting
                    is about. */}
                {coverSrc || showVideo ? (
                  <motion.div variants={item} className="mt-4">
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-(--olivea-olive)/10 bg-(--olivea-cream)/40">
                      <div className="aspect-video md:aspect-16/8 relative">
                        {/* Base layer. Goes through next/image, so it arrives
                            as a resized AVIF/WebP and is usually painted
                            before the video has finished buffering. */}
                        {coverSrc ? (
                          <Image
                            src={coverSrc}
                            alt={coverAlt ?? popup.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 640px"
                            className="object-cover object-center"
                            priority={false}
                          />
                        ) : null}

                        {showVideo ? (
                          <video
                            key={videoSrc}
                            src={videoSrc}
                            poster={coverSrc}
                            className={[
                              "absolute inset-0 h-full w-full object-cover object-center",
                              "transition-opacity duration-700 ease-out",
                              videoReady ? "opacity-100" : "opacity-0",
                            ].join(" ")}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            onCanPlay={() => setVideoReady(true)}
                            onError={() => setVideoFailed(true)}
                            aria-label={coverAlt ?? popup.title}
                          />
                        ) : null}

                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-black/5 to-transparent" />
                      </div>
                    </div>
                  </motion.div>
                ) : null}

                {/* Content well */}
                <motion.div
                  variants={item}
                  className={[
                    "mt-5",
                    "rounded-3xl",
                    "bg-(--olivea-cream)/92",
                    "ring-1 ring-(--olivea-olive)/10",
                    "px-5 py-5",
                  ].join(" ")}
                >
                  <h3 className="text-[20px] md:text-[24px] leading-tight font-semibold text-(--olivea-olive)">
                    {popup.title}
                  </h3>

                  <p className="mt-2 text-[14.5px] leading-relaxed text-(--olivea-clay) opacity-95">
                    {popup.excerpt}
                  </p>

                  <div className="mt-5 flex flex-col md:flex-row gap-3">
                    {/* An action opens the booking modal in place and wins
                        over href — sending someone to a page to hunt for the
                        booking button is a worse version of opening it. */}
                    {popup.action ? (
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          openReservationModal(popup.action);
                        }}
                        className={primaryCta}
                      >
                        {popup.ctaLabel?.trim() || defaultActionLabel}
                      </button>
                    ) : popup.href ? (
                      <Link href={popup.href} onClick={close} className={primaryCta}>
                        {popup.ctaLabel?.trim() ||
                          (popup.kind === "journal"
                            ? popup.lang === "es"
                              ? "Leer"
                              : "Read"
                            : popup.lang === "es"
                              ? "Ver más"
                              : "Learn more")}
                      </Link>
                    ) : null}

                    {/* Tap to call. A number printed in the body is something
                        a visitor has to select and copy on a phone; here it is
                        one tap. The digits are stripped for the href and the
                        written formatting is kept for the label, so the number
                        stays readable on desktop where tel: often does
                        nothing. Narrower tracking than the other buttons
                        because a full number at 0.28em does not fit. */}
                    {popup.phone ? (
                      <a
                        href={`tel:${popup.phone.replace(/[^\d+]/g, "")}`}
                        onClick={close}
                        aria-label={`${es ? "Llamar al" : "Call"} ${popup.phone}`}
                        className={[
                          "w-full md:w-auto",
                          "inline-flex items-center justify-center gap-2",
                          "rounded-2xl px-4 py-3.5 md:py-3",
                          "bg-white/70 ring-1 ring-(--olivea-olive)/25",
                          "text-[12px] tracking-[0.08em]",
                          "text-(--olivea-olive) hover:bg-white/90 transition",
                        ].join(" ")}
                      >
                        <Phone size={14} strokeWidth={1.75} aria-hidden />
                        {popup.phone}
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={close}
                      className={[
                        "w-full md:w-auto",
                        "inline-flex items-center justify-center",
                        "rounded-2xl px-4 py-3.5 md:py-3",
                        "bg-white/70 ring-1 ring-(--olivea-olive)/10",
                        "text-[12px] uppercase tracking-[0.28em]",
                        "text-(--olivea-olive) opacity-90 hover:opacity-100 transition",
                      ].join(" ")}
                    >
                      {es ? "Ahora no" : "Not now"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
