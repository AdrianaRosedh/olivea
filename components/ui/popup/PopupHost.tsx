// components/ui/popup/PopupHost.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export type SitePopup =
  | {
      id: string;
      kind: "journal";
      lang: "es" | "en";
      title: string;
      excerpt: string;
      href: string;
      coverSrc?: string;
      coverAlt?: string;
      badge?: string;
    }
  | {
      id: string;
      kind: "announcement";
      lang: "es" | "en";
      title: string;
      excerpt: string;
      href?: string;
      badge?: string;
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

  const [popup, setPopup] = useState<SitePopup | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch active popup (single file via /api/popup, rule-aware using path)
  useEffect(() => {
    let cancelled = false;

    const p = pathname ?? "/";
    const url = `/api/popup?lang=${lang}&path=${encodeURIComponent(p)}`;

    fetch(url, { cache: "no-store" })
      .then((r) => r.json() as Promise<unknown>)
      .then((dataUnknown) => {
        if (cancelled) return;

        if (!isObject(dataUnknown) || !("popup" in dataUnknown)) {
          setPopup(null);
          return;
        }

        const maybe = (dataUnknown as PopupApiResponse).popup;
        setPopup(maybe && isSitePopup(maybe) ? maybe : null);
      })
      .catch(() => {
        if (!cancelled) setPopup(null);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, pathname]);

  const key = useMemo(() => (popup ? `${STORAGE_PREFIX}${popup.id}` : ""), [popup]);

  const close = useCallback(() => {
    setOpen(false);
    try {
      if (popup) localStorage.setItem(key, "1");
    } catch {}
  }, [key, popup]);

  useEffect(() => {
    if (!popup) return;

    // Extra safeguard: never show on journal pages
    if (pathname?.includes("/journal")) return;

    try {
      if (localStorage.getItem(key) === "1") return;
    } catch {}

    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;

    const cancel = scheduleAfterInteractive(() => setOpen(true));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancel?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [popup, key, close, pathname]);

  if (!popup) return null;

  const coverSrc = popup.kind === "journal" ? popup.coverSrc : undefined;
  const coverAlt = popup.kind === "journal" ? popup.coverAlt : undefined;

  // Motion: calm, natural
  const backdropVariants: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, backdropFilter: "blur(0px)" },
        show: {
          opacity: 1,
          backdropFilter: "blur(6px)",
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

          <div className="fixed inset-0 z-9999 flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
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

              {/* Mobile handle */}
              <div className="relative md:hidden pt-3 pb-2 flex justify-center">
                <div className="h-1 w-12 rounded-full bg-(--olivea-olive)/20" />
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
                {/* Media */}
                {coverSrc ? (
                  <motion.div variants={item} className="mt-4">
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-(--olivea-olive)/10 bg-white/10">
                      <div className="aspect-video md:aspect-16/8 relative">
                        <Image
                          src={coverSrc}
                          alt={coverAlt ?? popup.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 640px"
                          className="object-cover object-center"
                          priority={false}
                        />
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
                    {popup.href ? (
                      <Link
                        href={popup.href}
                        onClick={close}
                        className={[
                          "w-full md:w-auto",
                          "inline-flex items-center justify-center",
                          "rounded-2xl px-4 py-3.5 md:py-3",
                          "bg-(--olivea-olive) text-white",
                          "text-[12px] uppercase tracking-[0.28em]",
                          "shadow-[0_14px_34px_-20px_rgba(0,0,0,0.45)]",
                          "hover:opacity-95 transition",
                        ].join(" ")}
                      >
                        {popup.lang === "es" ? "Leer" : "Read"}
                      </Link>
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
                      {popup.lang === "es" ? "Ahora no" : "Not now"}
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
