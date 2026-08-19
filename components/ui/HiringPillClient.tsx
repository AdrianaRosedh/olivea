"use client";

// components/ui/HiringPillClient.tsx
// ─────────────────────────────────────────────────────────────────────
// The dismissible "we're hiring" pill shown in the bottom-left corner of
// public pages. Data (whether to show, role, count) is decided server-side
// in HiringPill.tsx; this only handles presentation + per-session dismissal.
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, X } from "lucide-react";

const DISMISS_KEY = "olivea:hiring-pill-dismissed";

export default function HiringPillClient({
  lang,
  count,
  role,
  href,
}: {
  lang: "es" | "en";
  count: number;
  role: string | null;
  href: string;
}) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  // Don't nag on the careers page itself — they're already there.
  const onCareersPage = pathname?.includes("/carreras") ?? false;

  // Reveal after mount (skip if dismissed this session), with a short delay so
  // it settles in after the page rather than competing with first paint.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (onCareersPage) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    const t = window.setTimeout(() => setShow(true), 1200);
    return () => window.clearTimeout(t);
  }, [onCareersPage]);

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — just hide for now */
    }
    setShow(false);
  };

  const heading = lang === "es" ? "Estamos contratando" : "We're hiring";
  const detail =
    count === 1 && role
      ? role
      : count === 0
        ? lang === "es" ? "Únete a nuestro equipo" : "Join our team"
        : lang === "es"
          ? `${count} vacantes abiertas`
          : `${count} open roles`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-4 z-40 max-w-[min(20rem,calc(100vw-2rem))]"
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <Link
            href={href}
            className="group flex items-center gap-3 rounded-full py-2.5 pl-3 pr-4
              bg-[var(--olivea-olive)] text-[var(--olivea-cream)]
              shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] ring-1 ring-white/10
              hover:bg-[var(--olivea-clay)] transition-colors duration-300"
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12">
              <Briefcase className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--olivea-olive)]" />
              </span>
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[13px] font-semibold tracking-wide">{heading}</span>
              <span className="block truncate text-[11px] text-[var(--olivea-cream)]/75">{detail}</span>
            </span>
            <span
              aria-hidden
              className="ml-1 text-[var(--olivea-cream)]/60 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label={lang === "es" ? "Cerrar" : "Dismiss"}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center
              rounded-full bg-white text-[var(--olivea-ink)] shadow-md ring-1 ring-black/5
              hover:bg-[var(--olivea-cream)] transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
